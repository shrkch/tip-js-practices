// Предметная логика ПР7: чистые функции без React.
// Ни одна функция не изменяет переданные массивы и объекты — всегда возвращается новый результат.
export { validateTaskDraft } from './form-validation.js';

export const PRIORITY_LABELS = Object.freeze({ low: 'Низкий', medium: 'Средний', high: 'Высокий' });

// Варианты фильтра по статусу. value — строка, как в атрибуте value у кнопки/select.
export const STATUS_FILTERS = Object.freeze([
  Object.freeze({ value: '', label: 'Все' }),
  Object.freeze({ value: 'false', label: 'В работе' }),
  Object.freeze({ value: 'true', label: 'Завершенные' }),
]);

export const EMPTY_FILTERS = Object.freeze({ q: '', completed: '', priority: '', categoryId: '' });

// Фильтры приходят из полей формы строками; пустая строка означает «не фильтровать».
export function selectTasks(tasks, filters) {
  const needle = String(filters.q ?? '').trim().toLocaleLowerCase('ru-RU');
  const categoryId = filters.categoryId === '' ? null : Number(filters.categoryId);

  return tasks.filter(task => {
    if (filters.completed !== '' && String(task.completed) !== filters.completed) return false;
    if (filters.priority !== '' && task.priority !== filters.priority) return false;
    if (categoryId !== null && task.categoryId !== categoryId) return false;
    return needle === '' || task.title.toLocaleLowerCase('ru-RU').includes(needle);
  });
}

export function getTaskStats(tasks) {
  const completed = tasks.reduce((count, task) => count + (task.completed ? 1 : 0), 0);
  return { total: tasks.length, completed, active: tasks.length - completed };
}

// Следующий свободный id: на 1 больше максимального (в наборе есть разрывы 1, 4, 7...).
export function getNextId(tasks) {
  return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
}

export function addTask(tasks, value, id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new RangeError('id должен быть положительным целым числом.');
  }
  if (tasks.some(task => task.id === id)) {
    throw new RangeError(`Задача с id ${id} уже существует.`);
  }
  return [...tasks, { id, ...value, completed: false }];
}

// Редактирование меняет только поля формы; id и completed остаются прежними.
export function updateTask(tasks, id, value) {
  return tasks.map(task => (task.id === id ? { ...task, ...value, id, completed: task.completed } : task));
}

export function toggleTask(tasks, id) {
  return tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task));
}

export function removeTask(tasks, id) {
  return tasks.filter(task => task.id !== id);
}
