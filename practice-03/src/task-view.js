import { getTaskStats } from "./task-service.js";

const PRIORITY_LABELS = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

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

export function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task-card";
  item.dataset.taskId = String(task.id);
  if (task.completed) {
    item.classList.add("is-completed");
  }

  const title = createTextElement("h3", "task-title", task.title);
  const status = createTextElement(
    "p",
    "task-status",
    task.completed ? "Выполнена" : "В работе",
  );
  const priority = createTextElement("p", "task-priority", PRIORITY_LABELS[task.priority]);

  const toggleButton = createActionButton("toggle", "Выполнена");
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  const deleteButton = createActionButton("delete", "Удалить");

  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(toggleButton, deleteButton);

  item.append(title, status, priority, actions);
  return item;
}

export function renderTaskList(listElement, tasks) {
  const cards = tasks.map(createTaskElement);
  listElement.replaceChildren(...cards);
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  const values = {
    total: String(total),
    completed: String(completed),
    pending: String(pending),
    progress: `${progress.toFixed(1)}%`,
    visible: String(visibleCount),
  };

  for (const [name, value] of Object.entries(values)) {
    summaryElement.querySelector(`[data-stat="${name}"]`).textContent = value;
  }
}

export function renderEmptyState(messageElement, total, visibleCount) {
  if (visibleCount > 0) {
    messageElement.textContent = "";
    messageElement.hidden = true;
    return;
  }

  messageElement.textContent =
    total === 0 ? "Список задач пуст." : "Нет задач по выбранному фильтру.";
  messageElement.hidden = false;
}
