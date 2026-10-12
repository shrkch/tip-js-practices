"use strict";

const totalTasks = 12;
const completedTasks = 5;

const MAX_TASKS = 1000;

if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  console.log("Ошибка: количество задач должно быть числом, а не строкой или другим типом.");
} else if (Number.isNaN(totalTasks) || Number.isNaN(completedTasks)) {
  console.log("Ошибка: недопустимое числовое значение (NaN).");
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом.");
} else if (totalTasks < 0 || completedTasks < 0) {
  console.log("Ошибка: количество задач не может быть отрицательным.");
} else if (totalTasks > MAX_TASKS) {
  console.log(`Ошибка: всего задач не может быть больше ${MAX_TASKS}.`);
} else if (completedTasks > totalTasks) {
  console.log("Ошибка: выполнено больше задач, чем существует.");
} else if (totalTasks === 0) {
  console.log("Задач пока нет");
} else {
  const remainingTasks = totalTasks - completedTasks;
  const progress = (completedTasks / totalTasks) * 100;

  let status;
  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  } else {
    status = "В работе";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${progress.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}
