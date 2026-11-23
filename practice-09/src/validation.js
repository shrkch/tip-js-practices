import { HttpError, invalidQuery } from './errors.js';

const PRIORITIES = new Set(['low', 'medium', 'high']);
const FILTER_NAMES = new Set(['completed', 'priority', 'categoryId', 'q']);
const MAX_TITLE = 100;

// Строка → положительное безопасное целое или null.
// Запрещены ведущие нули, знаки, пробелы, дроби и экспонента: '01', '+1', ' 4 ', '1.5', '1e2'.
export function parsePositiveId(raw) {
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

// Каждый параметр допускается не более одного раза.
function single(params, name) {
  const values = params.getAll(name);
  if (values.length > 1) throw invalidQuery(`Параметр ${name} указан несколько раз.`);
  return values.length === 1 ? values[0] : null;
}

// URLSearchParams → { completed, priority, categoryId, q }.
// Отсутствующий параметр — null (для q — пустая строка). Ошибка — HttpError 400 INVALID_QUERY.
export function parseFilters(params) {
  for (const name of params.keys()) {
    if (!FILTER_NAMES.has(name)) throw invalidQuery(`Неизвестный параметр запроса: ${name}.`);
  }
  const filters = { completed: null, priority: null, categoryId: null, q: '' };

  const completed = single(params, 'completed');
  if (completed !== null) {
    if (completed !== 'true' && completed !== 'false') {
      throw invalidQuery('completed должен быть true или false.');
    }
    filters.completed = completed === 'true';
  }

  const priority = single(params, 'priority');
  if (priority !== null) {
    if (!PRIORITIES.has(priority)) throw invalidQuery('priority должен быть low, medium или high.');
    filters.priority = priority;
  }

  const categoryId = single(params, 'categoryId');
  if (categoryId !== null) {
    filters.categoryId = parsePositiveId(categoryId);
    if (filters.categoryId === null) throw invalidQuery('categoryId должен быть положительным целым числом.');
  }

  const q = single(params, 'q');
  if (q !== null) {
    filters.q = q.trim();
    if (filters.q.length > MAX_TITLE) throw invalidQuery(`q не длиннее ${MAX_TITLE} символов.`);
  }
  return filters;
}

// Проверка тела POST /api/tasks (для КР3). Возвращает { valid, value, errors }.
// title обязателен, строка, после trim() — от 1 до 100 символов.
export function validateTaskDraft(body, categories) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, value: null, errors: { body: 'Тело запроса должно быть JSON-объектом.' } };
  }
  const errors = {};

  if (typeof body.title !== 'string') {
    errors.title = 'Поле title обязательно и должно быть строкой.';
  } else if (body.title.trim().length === 0) {
    errors.title = 'Название не может быть пустым или состоять из пробелов.';
  } else if (body.title.trim().length > MAX_TITLE) {
    errors.title = `Название не длиннее ${MAX_TITLE} символов.`;
  }

  if (!PRIORITIES.has(body.priority)) {
    errors.priority = 'priority должен быть low, medium или high.';
  }

  if (!Number.isSafeInteger(body.categoryId) || !categories.some(c => c.id === body.categoryId)) {
    errors.categoryId = 'categoryId должен быть id существующей категории.';
  }

  if (Object.keys(errors).length > 0) return { valid: false, value: null, errors };
  return {
    valid: true,
    value: { title: body.title.trim(), priority: body.priority, categoryId: body.categoryId },
    errors: {},
  };
}

export function assertValidDraft(body, categories) {
  const result = validateTaskDraft(body, categories);
  if (!result.valid) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Данные задачи не прошли проверку.', result.errors);
  }
  return result.value;
}
