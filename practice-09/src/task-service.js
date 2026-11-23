// Чистые функции выборки. Не зависят от Express и не меняют исходный массив.

// Все фильтры объединяются через И. null означает «фильтр не задан».
export function selectTasks(tasks, filters) {
  const needle = filters.q.toLocaleLowerCase('ru-RU');
  return tasks.filter(task =>
    (filters.completed === null || task.completed === filters.completed)
    && (filters.priority === null || task.priority === filters.priority)
    && (filters.categoryId === null || task.categoryId === filters.categoryId)
    && (needle === '' || task.title.toLocaleLowerCase('ru-RU').includes(needle)));
}

// Поиск по id, а не по индексу: id в наборе идут с разрывами (1, 4, 7, ...).
export function findTask(tasks, id) {
  return tasks.find(task => task.id === id) ?? null;
}
