import { Router } from 'express';
import { HttpError } from './errors.js';
import { assertValidDraft, parseFilters, parsePositiveId } from './validation.js';
import { findTask, selectTasks } from './task-service.js';

const READ_METHODS = 'GET, HEAD, OPTIONS';

// Для маршрута разрешены только перечисленные методы; остальные получают 405 и заголовок Allow.
function onlyMethods(allow) {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', allow).status(204).end();
      return;
    }
    if (!allow.split(', ').includes(req.method)) {
      res.set('Allow', allow);
      next(new HttpError(405, 'METHOD_NOT_ALLOWED', `Метод ${req.method} не поддерживается. Доступно: ${allow}.`));
      return;
    }
    next();
  };
}

export function createRouter(store, { allowCreate = false } = {}) {
  const router = Router();
  const tasksMethods = allowCreate ? 'GET, HEAD, POST, OPTIONS' : READ_METHODS;

  router.all('/health', onlyMethods(READ_METHODS));
  router.get('/health', (req, res) => {
    res.json({ data: { status: 'ok' } });
  });

  router.all('/categories', onlyMethods(READ_METHODS));
  router.get('/categories', (req, res) => {
    const categories = store.listCategories();
    res.json({ data: categories, meta: { total: categories.length } });
  });

  // GET /api/tasks?completed=true&priority=high&categoryId=2&q=текст
  router.all('/tasks', onlyMethods(tasksMethods));
  router.get('/tasks', (req, res) => {
    // Query-параметры читаются из исходной строки запроса, чтобы видеть повторы (q=a&q=b).
    const params = new URL(req.originalUrl, 'http://localhost').searchParams;
    const filters = parseFilters(params);                 // 400 INVALID_QUERY при ошибке
    const data = selectTasks(store.listTasks(), filters);
    res.status(200).json({ data, meta: { total: data.length, filters } });
  });

  // POST /api/tasks — включается только в режиме КР3 (npm run kr3).
  if (allowCreate) {
    router.post('/tasks', (req, res) => {
      const value = assertValidDraft(req.body, store.listCategories());   // 400 VALIDATION_ERROR
      const task = store.createTask(value);
      res.status(201).location(`/api/tasks/${task.id}`).json({ data: task });
    });
  }

  router.all('/tasks/:id', onlyMethods(READ_METHODS));
  router.get('/tasks/:id', (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (id === null) throw new HttpError(400, 'INVALID_ID', 'id должен быть положительным целым числом.');
    const task = findTask(store.listTasks(), id);
    if (!task) throw new HttpError(404, 'TASK_NOT_FOUND', `Задача с id ${id} не найдена.`, { id });
    res.json({ data: task });
  });

  return router;
}
