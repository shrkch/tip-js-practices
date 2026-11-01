import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

// Методы результата:
// getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask,
// setTaskCompleted, deleteTask и resetDemoData.
// Последний аргумент каждого метода данных — { signal }.
export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("createTaskApi ожидает клиент с методом requestJson.");
  }

  function normalizeFilters(filters) {
    if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
      throw new TypeError("Фильтры должны быть обычным объектом.");
    }
    const query = {};
    for (const [name, value] of Object.entries(filters)) {
      if (!ALLOWED_FILTERS.has(name)) throw new TypeError(`Неизвестный фильтр: ${name}.`);
      if (value === undefined) continue;

      if (name === "completed") {
        if (typeof value !== "boolean") throw new TypeError("completed должен быть true или false.");
        query.completed = value;
      } else if (name === "priority") {
        if (!ALLOWED_PRIORITIES.has(value)) throw new TypeError("priority должен быть low, medium или high.");
        query.priority = value;
      } else if (name === "categoryId") {
        if (!isPositiveSafeInteger(value)) throw new TypeError("categoryId должен быть положительным целым числом.");
        query.categoryId = value;
      } else if (name === "q") {
        if (typeof value !== "string") throw new TypeError("q должен быть строкой.");
        const q = value.trim();
        if (q.length > 100) throw new TypeError("q должен содержать не более 100 символов.");
        if (q !== "") query.q = q;
      }
    }
    return query;
  }

  function assertId(id) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id задачи должен быть положительным безопасным целым числом.");
    }
  }

  function assertUniqueIds(items, label) {
    if (new Set(items.map((item) => item.id)).size !== items.length) {
      throw invalidResponse(`В ответе ${label} повторяются id.`);
    }
  }

  function requireTask(payload, label) {
    if (!payload || !isTask(payload.data)) {
      throw invalidResponse(`Ответ ${label} не соответствует схеме задачи.`);
    }
    return payload.data;
  }

  function withSignal(options, extra = {}) {
    return options?.signal ? { ...extra, signal: options.signal } : extra;
  }

  async function getTasks(filters = {}, options = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", withSignal(options, { query }));
    if (!payload || !Array.isArray(payload.data) || !payload.data.every(isTask)) {
      throw invalidResponse("Ответ /tasks не соответствует схеме задач.");
    }
    assertUniqueIds(payload.data, "/tasks");
    if (!payload.meta || payload.meta.total !== payload.data.length) {
      throw invalidResponse("meta.total не совпадает с количеством задач.");
    }
    return { tasks: payload.data, meta: payload.meta };
  }

  async function getTaskById(id, options = {}) {
    assertId(id);
    const payload = await client.requestJson(`/tasks/${id}`, withSignal(options));
    return requireTask(payload, `/tasks/${id}`);
  }

  async function getCategories(options = {}) {
    const payload = await client.requestJson("/categories", withSignal(options));
    if (!payload || !Array.isArray(payload.data) || !payload.data.every(isCategory)) {
      throw invalidResponse("Ответ /categories не соответствует схеме категорий.");
    }
    assertUniqueIds(payload.data, "/categories");
    return payload.data;
  }

  async function loadInitialData(filters = {}, options = {}) {
    // Оба запроса стартуют до общего ожидания.
    const [taskResult, categories] = await Promise.all([
      getTasks(filters, options),
      getCategories(options),
    ]);
    return { tasks: taskResult.tasks, categories, meta: taskResult.meta };
  }

  async function createTask(draft, options = {}) {
    const payload = await client.requestJson("/tasks", withSignal(options, {
      method: "POST",
      body: { title: draft.title, priority: draft.priority, categoryId: draft.categoryId },
    }));
    return requireTask(payload, "POST /tasks");
  }

  async function updateTask(id, changes, options = {}) {
    assertId(id);
    const payload = await client.requestJson(`/tasks/${id}`, withSignal(options, {
      method: "PATCH",
      body: { ...changes },
    }));
    return requireTask(payload, `PATCH /tasks/${id}`);
  }

  async function setTaskCompleted(id, completed, options = {}) {
    assertId(id);
    if (typeof completed !== "boolean") {
      throw new TypeError("completed должен быть true или false.");
    }
    const payload = await client.requestJson(`/tasks/${id}`, withSignal(options, {
      method: "PATCH",
      body: { completed },
    }));
    return requireTask(payload, `PATCH /tasks/${id}`);
  }

  async function deleteTask(id, options = {}) {
    assertId(id);
    const payload = await client.requestJson(`/tasks/${id}`, withSignal(options, { method: "DELETE" }));
    if (payload !== null) {
      throw invalidResponse("После DELETE ожидался ответ 204 без тела.");
    }
    return null;
  }

  async function resetDemoData(options = {}) {
    const payload = await client.requestJson("/debug/reset", withSignal(options, { method: "POST" }));
    if (!payload || !payload.data || payload.data.reset !== true || !Number.isSafeInteger(payload.data.total)) {
      throw invalidResponse("Сервер не подтвердил сброс данных.");
    }
    return payload.data;
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
    resetDemoData,
  };
}
