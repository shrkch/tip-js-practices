import { demoTasks } from "./src/data.js";
import { setTaskCompleted } from "./src/task-service.js";

const result = setTaskCompleted(demoTasks, 4, true);
console.log("Проверка 1: setTaskCompleted(demoTasks, 4, true)");
console.log("ok:", result.ok);
console.log("Новая запись id 4, completed:", result.tasks.find((task) => task.id === 4).completed);
console.log("Исходная запись id 4, completed:", demoTasks.find((task) => task.id === 4).completed);

const failed = setTaskCompleted(demoTasks, 777, true);
console.log("Проверка 2: setTaskCompleted(demoTasks, 777, true)");
console.log(failed);
