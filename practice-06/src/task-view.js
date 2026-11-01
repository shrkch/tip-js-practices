const PRIORITY_LABELS = Object.freeze({
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
});

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function createActionButton(action, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  button.append(createTextElement("span", "action-label", label));
  return button;
}

export function createTaskElement(task, category) {
  const item = document.createElement("li");
  item.className = "task-card";
  item.dataset.taskId = String(task.id);
  if (task.completed) item.classList.add("is-completed");

  // Данные с сервера считаются недоверенными: только textContent.
  const title = createTextElement("h3", "task-title", task.title);

  const meta = document.createElement("p");
  meta.className = "task-meta";
  meta.append(
    createTextElement("span", "task-status", task.completed ? "Выполнена" : "В работе"),
    createTextElement("span", "task-priority", `Приоритет: ${PRIORITY_LABELS[task.priority] ?? task.priority}`),
    createTextElement("span", "task-category", category?.name ?? "Без категории"),
  );

  const toggleButton = createActionButton("toggle", task.completed ? "Вернуть в работу" : "Выполнена");
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(
    toggleButton,
    createActionButton("edit", "Изменить"),
    createActionButton("delete", "Удалить"),
  );

  item.append(title, meta, actions);
  return item;
}

export function renderTaskList(list, tasks, categories) {
  const byId = new Map((categories ?? []).map((category) => [category.id, category]));
  list.replaceChildren(...tasks.map((task) => createTaskElement(task, byId.get(task.categoryId))));
}
