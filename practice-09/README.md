# Практическая работа № 9. Собственный HTTP API на Express

## Данные работы

| Поле | Значение |
|---|---|
| Имя | Степанов Владимир |
| Группа | ЭФБО-17-25 |

## Запуск

Рабочая папка: `practice-09`.

```bash
npm ci
npm test          # 90 проверок
npm start         # http://127.0.0.1:5505/api — только чтение
npm run kr3       # то же + POST /api/tasks с валидацией (КР3)
npm run check:kr3 # проверки POST для КР3
```

Порт задаётся переменной `API_PORT` (по умолчанию 5505).

## Маршруты

| Метод | Путь | Ответ |
|---|---|---|
| GET, HEAD | `/api/health` | `{ data: { status: 'ok' } }` |
| GET, HEAD | `/api/categories` | `{ data, meta: { total } }` |
| GET, HEAD | `/api/tasks?completed&priority&categoryId&q` | `{ data, meta: { total, filters } }` |
| GET, HEAD | `/api/tasks/:id` | `{ data }`, 400 `INVALID_ID`, 404 `TASK_NOT_FOUND` |
| OPTIONS | любой маршрут API | 204 и CORS-заголовки |
| POST | `/api/tasks` (только `npm run kr3`) | 201 или 400 `VALIDATION_ERROR` |

Неподдерживаемый метод — 405 `METHOD_NOT_ALLOWED` с заголовком `Allow`, неизвестный путь — 404 `ROUTE_NOT_FOUND`,
непредвиденная ошибка — 500 `INTERNAL_ERROR` без текста исходной ошибки.

## Структура

| Файл | Ответственность |
|---|---|
| `src/server.js` | Запуск сервера на порту |
| `src/app.js` | `createApp`: общие заголовки, роутер, единый обработчик ошибок |
| `src/routes.js` | Маршруты и ограничение методов |
| `src/validation.js` | `parsePositiveId`, `parseFilters`, проверка тела POST |
| `src/task-service.js` | `selectTasks`, `findTask` — чистые функции |
| `src/store.js` | Хранилище в памяти (копия `data.js`) |
| `src/errors.js` | Класс `HttpError` |

## Автоматизированные проверки

`npm test` — 90 из 90. `npm run check:kr3` — 5 из 5.
