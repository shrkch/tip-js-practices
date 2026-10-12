"use strict";

const totalTasks = 12;
const completedTasks = 5;
const dailyLimit = 3;

const MAX_TASKS = 1000;
const MAX_LIMIT = 1000;

let error = "";

if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  error = "количество задач должно быть числом.";
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  error = "количество задач должно быть целым числом.";
} else if (totalTasks < 0 || completedTasks < 0) {
  error = "количество задач не может быть отрицательным.";
} else if (totalTasks > MAX_TASKS) {
  error = `всего задач не может быть больше ${MAX_TASKS}.`;
} else if (completedTasks > totalTasks) {
  error = "некорректное число выполненных задач (больше общего).";
} else if (typeof dailyLimit !== "number") {
  error = "дневная норма должна быть числом, а не строкой.";
} else if (!Number.isInteger(dailyLimit)) {
  error = "дневная норма должна быть целым числом.";
} else if (dailyLimit < 1 || dailyLimit > MAX_LIMIT) {
  error = `дневная норма должна быть от 1 до ${MAX_LIMIT}.`;
}

if (error !== "") {
  console.log(`Ошибка: ${error}`);
} else {
  let remaining = totalTasks - completedTasks;
  let day = 0;

  console.log(`Осталось задач: ${remaining}`);

  if (remaining === 0) {
    console.log("Все задачи уже выполнены");
  }

  while (remaining > 0) {
    day += 1;
    const doneToday = Math.min(dailyLimit, remaining);
    remaining -= doneToday;
    console.log(`День ${day}: выполнено ${doneToday}, осталось ${remaining}`);
  }

  console.log(`Потребуется дней: ${day}`);
}
