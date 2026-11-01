import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

const REQUIRED_VIEW_METHODS = [
  "setListState",
  "setTasks",
  "setCategories",
  "setTotal",
  "setFormTask",
  "showFormErrors",
  "setMutationPending",
  "notify",
];
const REQUIRED_API_METHODS = [
  "loadInitialData",
  "getTasks",
  "createTask",
  "updateTask",
  "setTaskCompleted",
  "deleteTask",
  "resetDemoData",
];

function isAborted(error) {
  return (error instanceof ApiError && error.kind === "aborted") || error?.name === "AbortError";
}

// view — адаптер из dom-app.js. Контроллер не должен обращаться к document.
// Обязательные методы результата:
// start, applyFilters, refresh, submit, beginEdit, cancelEdit,
// toggleTask, deleteTask, resetData и destroy.
export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (!api || REQUIRED_API_METHODS.some((name) => typeof api[name] !== "function")) {
    throw new TypeError("createAppController ожидает api с методами задач.");
  }
  if (!view || REQUIRED_VIEW_METHODS.some((name) => typeof view[name] !== "function")) {
    throw new TypeError("createAppController ожидает view с методами отображения.");
  }
  if (typeof validateDraft !== "function") {
    throw new TypeError("validateDraft должен быть функцией.");
  }

  let tasks = [];
  let categories = null; // null — категории ещё не получены
  let filters = {};
  let editingId = null;
  let activeLoad = null; // AbortController текущей загрузки
  let loadNumber = 0;

  function showTasks(list, total) {
    tasks = list;
    view.setTasks(list, categories ?? []);
    view.setTotal(total);
    view.setListState(list.length > 0 ? "ready" : "empty");
  }

  // Загружает список с текущими фильтрами. Если категорий ещё нет,
  // выполняется начальная параллельная загрузка задач и категорий.
  async function loadCurrentTasks() {
    activeLoad?.abort();
    const controller = new AbortController();
    activeLoad = controller;
    const current = ++loadNumber;
    const requestFilters = { ...filters };

    view.setListState("loading");
    try {
      if (categories === null) {
        const result = await api.loadInitialData(requestFilters, { signal: controller.signal });
        if (current !== loadNumber) return; // устаревший ответ
        categories = result.categories;
        view.setCategories(categories);
        showTasks(result.tasks, result.meta?.total ?? result.tasks.length);
      } else {
        const result = await api.getTasks(requestFilters, { signal: controller.signal });
        if (current !== loadNumber) return;
        showTasks(result.tasks, result.meta?.total ?? result.tasks.length);
      }
    } catch (error) {
      if (current !== loadNumber || isAborted(error)) return; // отмена не показывается
      view.setListState("error", messageForError(error));
    } finally {
      if (activeLoad === controller) activeLoad = null;
    }
  }

  // Общая схема изменяющей операции: блокировка → запрос → повторный GET → разблокировка.
  async function runMutation(action, successMessage, { afterSuccess } = {}) {
    view.setMutationPending(true);
    try {
      await action();
      afterSuccess?.();
      view.notify(successMessage, "success");
      await loadCurrentTasks();
    } catch (error) {
      view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  function findTask(id) {
    return tasks.find((task) => task.id === id) ?? null;
  }

  function resetForm() {
    editingId = null;
    view.setFormTask(null);
    view.showFormErrors({});
  }

  return {
    start(initialFilters = {}) {
      filters = { ...initialFilters };
      return loadCurrentTasks();
    },

    applyFilters(nextFilters = {}) {
      filters = { ...nextFilters };
      return loadCurrentTasks();
    },

    refresh() {
      return loadCurrentTasks();
    },

    async submit(draft) {
      const result = validateDraft(draft, categories ?? []);
      if (!result.valid) {
        view.showFormErrors(result.errors);
        return;
      }
      view.showFormErrors({});
      const id = editingId;
      if (id === null) {
        await runMutation(() => api.createTask(result.value), "Задача добавлена.", {
          afterSuccess: resetForm,
        });
      } else {
        await runMutation(() => api.updateTask(id, result.value), `Задача № ${id} изменена.`, {
          afterSuccess: resetForm,
        });
      }
    },

    beginEdit(id) {
      const task = findTask(id);
      if (!task) {
        view.notify("Задача не найдена в текущем списке. Обновите список.", "error");
        return;
      }
      editingId = id;
      view.showFormErrors({});
      view.setFormTask(task);
    },

    cancelEdit() {
      resetForm();
    },

    async toggleTask(id) {
      const task = findTask(id);
      if (!task) {
        view.notify("Задача не найдена в текущем списке. Обновите список.", "error");
        return;
      }
      const completed = !task.completed;
      await runMutation(
        () => api.setTaskCompleted(id, completed),
        completed ? `Задача № ${id} выполнена.` : `Задача № ${id} возвращена в работу.`,
      );
    },

    async deleteTask(id) {
      await runMutation(() => api.deleteTask(id), `Задача № ${id} удалена.`, {
        afterSuccess() {
          if (editingId === id) resetForm();
        },
      });
    },

    async resetData() {
      await runMutation(() => api.resetDemoData(), "Исходные данные восстановлены.", {
        afterSuccess: resetForm,
      });
    },

    destroy() {
      activeLoad?.abort();
      activeLoad = null;
      loadNumber += 1;
    },
  };
}
