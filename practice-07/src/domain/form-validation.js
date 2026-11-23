const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const MAX_TITLE_LENGTH = 100;

// Возвращает { valid, value, errors }.
// value содержит нормализованные title, priority и числовой categoryId.
export function validateTaskDraft(draft, categories) {
  const errors = {};

  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  if (typeof draft?.title !== "string") {
    errors.title = "Название должно быть строкой.";
  } else if (title.length < 1 || title.length > MAX_TITLE_LENGTH) {
    errors.title = `Название должно содержать от 1 до ${MAX_TITLE_LENGTH} символов.`;
  }

  const priority = draft?.priority;
  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Выберите приоритет: low, medium или high.";
  }

  const rawCategory = draft?.categoryId;
  const categoryId = rawCategory === "" || rawCategory === null || rawCategory === undefined
    ? NaN
    : Number(rawCategory);
  const knownCategory = Array.isArray(categories)
    && categories.some((category) => category.id === categoryId);
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0 || !knownCategory) {
    errors.categoryId = "Выберите существующую категорию.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, value: null, errors };
  }
  return { valid: true, value: { title, priority, categoryId }, errors: {} };
}
