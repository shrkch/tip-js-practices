// КР2, задание 1: проверка и нормализация названия в validateTaskDraft.
// Запуск: node kr2-task1.js
import { validateTaskDraft } from "./src/form-validation.js";

const tasks = [];

const valid = validateTaskDraft({ id: "20", title: " Изучить localStorage ", priority: "high" }, tasks);
console.log("Вызов 1 (title = \" Изучить localStorage \"):");
console.log(valid);
console.log("value.title:", JSON.stringify(valid.value?.title));

const blank = validateTaskDraft({ id: "20", title: " ", priority: "high" }, tasks);
console.log("\nВызов 2 (title = \" \"):");
console.log(blank);
