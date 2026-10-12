import { demoTasks } from "./src/data.js";
import { getPendingTasks } from "./src/task-service.js";

console.log("getPendingTasks(demoTasks):");
console.log(getPendingTasks(demoTasks));

console.log("getPendingTasks([]):");
console.log(getPendingTasks([]));
