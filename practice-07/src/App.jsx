import { useState } from 'react';
import { categories, tasks as initialTasks } from './data.js';
import { createInitialFilters } from './variant.js';
import {
  EMPTY_FILTERS, selectTasks, getTaskStats, getNextId,
  addTask, updateTask, toggleTask, removeTask,
} from './domain/task-service.js';
import TaskStats from './components/TaskStats.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';

export default function App() {
  // Источники правды: полный список, фильтры и id редактируемой задачи.
  const [tasks, setTasks] = useState(() => [...initialTasks]);
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);

  // Производные данные вычисляются на каждом рендере, отдельного состояния для них нет.
  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);
  const editingTask = tasks.find(task => task.id === editingId) ?? null;

  function changeFilter(name, value) {
    setFilters(previous => ({ ...previous, [name]: value }));
  }

  function saveTask(value) {
    if (editingTask) {
      setTasks(previous => updateTask(previous, editingTask.id, value));
      setEditingId(null);
    } else {
      setTasks(previous => addTask(previous, value, getNextId(previous)));
    }
  }

  function handleToggle(id) {
    setTasks(previous => toggleTask(previous, id));
  }

  function handleDelete(task) {
    // Подтверждение — побочный эффект, поэтому оно вне функции обновления состояния.
    if (!window.confirm(`Удалить задачу «${task.title}»?`)) return;
    setTasks(previous => removeTask(previous, task.id));
    if (task.id === editingId) setEditingId(null);
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Мои задачи</h1>
        <TaskStats stats={stats} />
      </header>

      <TaskForm
        key={editingId ?? 'new'}
        task={editingTask}
        categories={categories}
        onSave={saveTask}
        onCancel={() => setEditingId(null)}
      />

      <TaskFilters
        filters={filters}
        categories={categories}
        onChange={changeFilter}
        onReset={() => setFilters({ ...EMPTY_FILTERS })}
      />

      <p className="app__found" aria-live="polite">Найдено: {visibleTasks.length}</p>

      <TaskList
        tasks={visibleTasks}
        totalCount={tasks.length}
        categories={categories}
        editingId={editingId}
        onToggle={handleToggle}
        onEdit={setEditingId}
        onDelete={handleDelete}
      />
    </main>
  );
}
