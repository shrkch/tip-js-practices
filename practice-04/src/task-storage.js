export const STORAGE_VERSION = 1;

const PRIORITIES = ["low", "medium", "high"];
const MAX_TITLE_LENGTH = 100;

function copyTasks(tasks) {
  return tasks.map((task) => ({ ...task }));
}

function isValidTask(task) {
  return (
    task !== null &&
    typeof task === "object" &&
    !Array.isArray(task) &&
    Number.isSafeInteger(task.id) &&
    task.id > 0 &&
    typeof task.title === "string" &&
    task.title === task.title.trim() &&
    task.title.length >= 1 &&
    task.title.length <= MAX_TITLE_LENGTH &&
    typeof task.completed === "boolean" &&
    PRIORITIES.includes(task.priority)
  );
}

// Все функции принимают объект storage явно, чтобы их можно было проверить
// без обращения к глобальному window.localStorage.

export function isValidTaskList(value) {
  if (!Array.isArray(value)) {
    return false;
  }
  const ids = new Set();
  for (const task of value) {
    if (!isValidTask(task) || ids.has(task.id)) {
      return false;
    }
    ids.add(task.id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallback = copyTasks(fallbackTasks);
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return { ok: true, source: "initial", tasks: fallback };
    }

    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || parsed.version !== STORAGE_VERSION) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallback,
        error: "Сохранённые данные имеют неизвестную версию; используется исходный набор.",
      };
    }
    if (!isValidTaskList(parsed.tasks)) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallback,
        error: "Сохранённые задачи не соответствуют схеме; используется исходный набор.",
      };
    }

    return { ok: true, source: "storage", tasks: copyTasks(parsed.tasks) };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallback,
      error: `Не удалось прочитать сохранённые данные (${error.message}); используется исходный набор.`,
    };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Список задач некорректен и не был сохранён." };
  }
  try {
    const json = JSON.stringify({ version: STORAGE_VERSION, tasks });
    storage.setItem(key, json);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: `Не удалось сохранить данные (${error.message}); после перезагрузки изменения могут быть потеряны.`,
    };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось удалить сохранённые данные: ${error.message}` };
  }
}
