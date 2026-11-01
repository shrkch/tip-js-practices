const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const MAX_TITLE_LENGTH = 100;

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let id;

  if (editingId === null) {
    // Режим создания: id берётся из формы (строка) и явно преобразуется в число.
    const rawId = draft.id;
    const isBlank =
      rawId === null || rawId === undefined || (typeof rawId === "string" && rawId.trim() === "");
    id = isBlank ? NaN : Number(rawId);

    if (!isPositiveSafeInteger(id)) {
      errors.id = "Укажите id — положительное целое число.";
    } else if (tasks.some((task) => task.id === id)) {
      errors.id = `Задача с id ${id} уже существует.`;
    }
  } else {
    // Режим редактирования: disabled-поле не попадает в FormData, id берётся из editingId.
    id = editingId;
    if (!isPositiveSafeInteger(id)) {
      errors.id = "Некорректный id редактируемой задачи.";
    } else if (!tasks.some((task) => task.id === id)) {
      errors.id = `Редактируемая задача с id ${id} не найдена.`;
    }
  }

  // Проверка и нормализация названия.
  let title = "";
  if (typeof draft.title !== "string") {
    errors.title = "Название должно быть строкой.";
  } else {
    title = draft.title.trim();
    if (title.length < 1 || title.length > MAX_TITLE_LENGTH) {
      errors.title = `Название должно содержать от 1 до ${MAX_TITLE_LENGTH} символов без краевых пробелов.`;
    }
  }

  const priority = draft.priority;
  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Выберите приоритет: low, medium или high.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { id, title, priority } };
}
