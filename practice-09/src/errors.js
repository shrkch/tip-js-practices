// Ошибка с HTTP-статусом и машинным кодом. Обработчик ошибок в app.js превращает её
// в единый JSON-ответ: { error: { code, message, details? } }.
export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export const invalidQuery = message => new HttpError(400, 'INVALID_QUERY', message);
