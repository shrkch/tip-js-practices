import { useCallback, useEffect, useRef, useState } from 'react';

// Кастомный хук связывает React-интерфейс с HTTP-клиентом (task-api.js).
// Хранит три основных состояния: данные (snapshot → tasks), флаг загрузки и ошибку.
export function useTaskData({ api, filters }) {
  const [state, setState] = useState({ status: 'loading', snapshot: null, error: null });
  const [pending, setPending] = useState(false);
  const [mutationError, setMutationError] = useState(null);

  const loadControllerRef = useRef(null);     // контроллер текущего GET
  const filtersRef = useRef(filters);         // актуальные фильтры для перезагрузки после записи
  const mountedRef = useRef(false);
  const busyRef = useRef(false);              // защита от двойного нажатия
  const mutationControllersRef = useRef(new Set());

  // Загрузка задач и категорий. Предыдущий незавершённый запрос отменяется,
  // а ответ отменённого запроса игнорируется — устаревшие данные не перезапишут свежие.
  const load = useCallback(() => {
    loadControllerRef.current?.abort();
    const controller = new AbortController();
    loadControllerRef.current = controller;
    setState(previous => ({ ...previous, status: 'loading' }));

    api.loadInitialData(filtersRef.current, { signal: controller.signal }).then(
      snapshot => {
        if (controller.signal.aborted) return;
        setState({ status: 'ready', snapshot, error: null });
      },
      error => {
        if (controller.signal.aborted) return;
        // Последний успешный снимок сохраняется, чтобы список не пропадал при сбое сети.
        setState(previous => ({ status: 'error', snapshot: previous.snapshot, error }));
      },
    );
  }, [api]);

  // При монтировании и при каждой смене фильтров — новый GET.
  useEffect(() => {
    filtersRef.current = filters;
    load();
    return () => loadControllerRef.current?.abort();
  }, [filters, load]);

  // Размонтирование отменяет незавершённые записи.
  useEffect(() => {
    mountedRef.current = true;
    const controllers = mutationControllersRef.current;
    return () => {
      mountedRef.current = false;
      for (const controller of controllers) controller.abort();
    };
  }, []);

  // Общая обёртка для POST/PATCH/DELETE: флаг pending, отдельная ошибка записи,
  // после успеха — повторная загрузка с текущими фильтрами. Возвращает true/false.
  const runMutation = useCallback(async request => {
    if (busyRef.current) return false;
    busyRef.current = true;
    const controller = new AbortController();
    mutationControllersRef.current.add(controller);
    setPending(true);
    setMutationError(null);

    try {
      await request({ signal: controller.signal });
      if (controller.signal.aborted || !mountedRef.current) return false;
      load();
      return true;
    } catch (error) {
      if (controller.signal.aborted || !mountedRef.current) return false;
      setMutationError(error);
      return false;
    } finally {
      mutationControllersRef.current.delete(controller);
      busyRef.current = false;
      if (mountedRef.current) setPending(false);
    }
  }, [load]);

  const saveTask = useCallback((id, value) => runMutation(options => (
    id === null ? api.createTask(value, options) : api.updateTask(id, value, options)
  )), [api, runMutation]);

  const toggleTask = useCallback(task => runMutation(options => (
    api.setTaskCompleted(task.id, !task.completed, options)
  )), [api, runMutation]);

  const deleteTask = useCallback(id => runMutation(options => api.deleteTask(id, options)), [api, runMutation]);

  const resetData = useCallback(() => runMutation(options => api.resetDemoData(options)), [api, runMutation]);

  const tasks = state.snapshot?.tasks ?? [];
  const isLoading = state.status === 'loading';
  // КР3, задание 2: временно раскомментировать, чтобы увидеть смену состояний в консоли DevTools.
  // console.log(isLoading, tasks.length);

  return {
    status: state.status,
    snapshot: state.snapshot,
    error: state.error,
    tasks,
    categories: state.snapshot?.categories ?? [],
    isLoading,
    pending,
    mutationError,
    refresh: load,
    saveTask,
    toggleTask,
    deleteTask,
    resetData,
  };
}
