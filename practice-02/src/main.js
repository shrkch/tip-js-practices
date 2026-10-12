import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

function printStats(label, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`[${label}] Всего: ${total}; выполнено: ${completed}; осталось: ${pending}`);
  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

function apply(currentTasks, result, label) {
  if (result.ok) {
    printStats(label, result.tasks);
    return result.tasks;
  }
  console.error(`[${label}] Ошибка: ${result.error}`);
  return currentTasks;
}

function printIds(tasks) {
  return tasks.map((task) => task.id).join(", ");
}

const demoSnapshot = JSON.stringify(demoTasks);
const variantSnapshot = JSON.stringify(variantTasks);

console.log("===== Общий сценарий: demoTasks =====");
let currentTasks = demoTasks;

console.table(currentTasks);
console.log("Названия:", getTaskTitles(currentTasks));
console.log("Невыполненные id:", printIds(getPendingTasks(currentTasks)));
printStats("Исходный набор", currentTasks);

currentTasks = apply(currentTasks, addTask(currentTasks, 20, "Добавить проверку", "high"), "Добавление id 20");
currentTasks = apply(currentTasks, setTaskCompleted(currentTasks, 4, true), "Выполнение id 4");
currentTasks = apply(currentTasks, renameTask(currentTasks, 10, "Подготовить инструкцию запуска"), "Переименование id 10");
currentTasks = apply(currentTasks, removeTask(currentTasks, 7), "Удаление id 7");

console.log("--- Обработка отказов ---");
currentTasks = apply(currentTasks, addTask(currentTasks, 4, "Дубликат"), "Повторный id 4");
currentTasks = apply(currentTasks, setTaskCompleted(currentTasks, 1, "true"), "Статус строкой");
currentTasks = apply(currentTasks, removeTask(currentTasks, 777), "Удаление id 777");

console.log("Итоговые id:", printIds(currentTasks));
console.log("Невыполненные id:", printIds(getPendingTasks(currentTasks)));
console.log("Название id 10:", findTaskById(currentTasks, 10).title);
console.log("demoTasks не изменён:", JSON.stringify(demoTasks) === demoSnapshot);

console.log(`\n===== Вариант ${variantNumber}: variantTasks =====`);
let variantCurrent = variantTasks;

console.table(variantCurrent);
printStats("Исходный набор", variantCurrent);

variantCurrent = apply(variantCurrent, addTask(variantCurrent, 80, "Сдать проект преподавателю", "high"), "Добавление id 80");
variantCurrent = apply(variantCurrent, setTaskCompleted(variantCurrent, 11, true), "Выполнение id 11");
variantCurrent = apply(variantCurrent, renameTask(variantCurrent, 23, "Составить подробный план работ"), "Переименование id 23");
variantCurrent = apply(variantCurrent, removeTask(variantCurrent, 37), "Удаление id 37");
variantCurrent = apply(variantCurrent, addTask(variantCurrent, 80, "Ещё раз сдать проект", "high"), "Повторный id 80");

console.log("Итоговые задачи:");
console.table(variantCurrent);
printStats("Итог варианта", variantCurrent);
console.log("variantTasks не изменён:", JSON.stringify(variantTasks) === variantSnapshot);
