const PRIORITIES = ["low", "medium", "high"];
const MAX_TITLE_LENGTH = 100;

function validateId(id) {
  if (typeof id !== "number") {
    return "id должен быть числом";
  }
  if (!Number.isSafeInteger(id) || id <= 0) {
    return "id должен быть положительным безопасным целым числом";
  }
  return null;
}

function normalizeTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название должно быть строкой" };
  }
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Название должно содержать от 1 до ${MAX_TITLE_LENGTH} символов`,
    };
  }
  return { ok: true, title: trimmed };
}

function hasTask(tasks, id) {
  return tasks.some((task) => task.id === id);
}

export function createTask(id, title, priority = "medium") {
  const idError = validateId(id);
  if (idError) {
    return { ok: false, error: idError };
  }

  const titleResult = normalizeTitle(title);
  if (!titleResult.ok) {
    return titleResult;
  }

  if (!PRIORITIES.includes(priority)) {
    return { ok: false, error: "Приоритет должен быть low, medium или high" };
  }

  return {
    ok: true,
    task: { id, title: titleResult.title, completed: false, priority },
  };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const created = createTask(id, title, priority);
  if (!created.ok) {
    return created;
  }

  if (hasTask(tasks, id)) {
    return { ok: false, error: `Задача с id ${id} уже существует` };
  }

  return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  const idError = validateId(id);
  if (idError) {
    return { ok: false, error: idError };
  }

  if (typeof completed !== "boolean") {
    return { ok: false, error: "completed должен быть true или false" };
  }

  if (!hasTask(tasks, id)) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  const updated = tasks.map((task) =>
    task.id === id ? { ...task, completed } : task,
  );

  return { ok: true, tasks: updated };
}

export function renameTask(tasks, id, title) {
  const idError = validateId(id);
  if (idError) {
    return { ok: false, error: idError };
  }

  const titleResult = normalizeTitle(title);
  if (!titleResult.ok) {
    return titleResult;
  }

  if (!hasTask(tasks, id)) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  const updated = tasks.map((task) =>
    task.id === id ? { ...task, title: titleResult.title } : task,
  );

  return { ok: true, tasks: updated };
}

export function removeTask(tasks, id) {
  const idError = validateId(id);
  if (idError) {
    return { ok: false, error: idError };
  }

  if (!hasTask(tasks, id)) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}
