import express from 'express';
import { HttpError } from './errors.js';
import { createRouter } from './routes.js';
import { createMemoryStore } from './store.js';

function sendError(res, error) {
  const body = { code: error.code, message: error.message };
  if (error.details !== undefined) body.details = error.details;
  res.status(error.status).json({ error: body });
}

// createApp не запускает сервер — это делает server.js. Так приложение удобно тестировать.
export function createApp({ store = createMemoryStore(), allowCreate = false } = {}) {
  const app = express();
  app.disable('x-powered-by');

  // Общие заголовки для всех ответов: CORS для чтения и запрет кэширования.
  app.use((req, res, next) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
      'Cache-Control': 'no-store',
    });
    next();
  });

  if (allowCreate) app.use(express.json({ limit: '16kb' }));

  app.use('/api', createRouter(store, { allowCreate }));

  app.use((req, res, next) => {
    next(new HttpError(404, 'ROUTE_NOT_FOUND', `Маршрут ${req.path} не найден.`));
  });

  // Единый обработчик ошибок: сервер не падает, клиент всегда получает JSON.
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error instanceof HttpError) return sendError(res, error);
    if (error instanceof URIError || error?.message === 'Failed to decode param') {
      return sendError(res, new HttpError(400, 'INVALID_ID', 'Идентификатор содержит некорректную %-последовательность.'));
    }
    if (error?.type === 'entity.parse.failed') {
      return sendError(res, new HttpError(400, 'INVALID_JSON', 'Тело запроса содержит некорректный JSON.'));
    }
    if (error?.type === 'entity.too.large') {
      return sendError(res, new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Тело запроса слишком велико.'));
    }
    console.error(error);
    // Текст исходной ошибки и stack наружу не отдаются.
    return sendError(res, new HttpError(500, 'INTERNAL_ERROR', 'Внутренняя ошибка сервера.'));
  });

  return app;
}
