import { categories as seedCategories, tasks as seedTasks } from './data.js';

// Хранилище в памяти процесса. Каждый вызов создаёт независимую копию данных,
// поэтому исходные массивы из data.js никогда не изменяются.
export function createMemoryStore() {
  const tasks = seedTasks.map(task => ({ ...task }));
  const categories = seedCategories.map(category => ({ ...category }));
  let nextId = Math.max(0, ...tasks.map(task => task.id)) + 1;

  return {
    listTasks: () => tasks,
    listCategories: () => categories,
    // Используется только в режиме КР3 (POST /api/tasks).
    createTask(value) {
      const task = { id: nextId, ...value, completed: false };
      nextId += 1;
      tasks.push(task);
      return task;
    },
  };
}
