import { useState } from 'react';
import { api, apiBaseUrl } from './config.js';
import { createInitialFilters } from './variant.js';
import { EMPTY_FILTERS } from './constants.js';
import { useTaskData } from './hooks/useTaskData.js';
import TaskFilters from './components/TaskFilters.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';

export default function App() {
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);
  const {
    status, error, tasks, categories, isLoading, pending, mutationError,
    refresh, saveTask, toggleTask, deleteTask, resetData,
  } = useTaskData({ api, filters });

  const editingTask = tasks.find(task => task.id === editingId) ?? null;
  const isFiltered = Object.values(filters).some(value => value.trim() !== '');

  function changeFilter(name, value) {
    setFilters(previous => ({ ...previous, [name]: value }));
  }

  async function handleSave(value) {
    const saved = await saveTask(editingTask ? editingTask.id : null, value);
    if (saved) setEditingId(null);
    return saved;
  }

  async function handleDelete(task) {
    if (!window.confirm(`Удалить задачу «${task.title}»?`)) return;
    const deleted = await deleteTask(task.id);
    if (deleted && task.id === editingId) setEditingId(null);
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Мои задачи</h1>
        <button type="button" className="button-secondary" disabled={pending} onClick={resetData}>
          Восстановить демо-данные
        </button>
      </header>

      <TaskForm
        key={editingId ?? 'new'}
        task={editingTask}
        categories={categories}
        pending={pending}
        serverError={mutationError}
        onSave={handleSave}
        onCancel={() => setEditingId(null)}
      />

      <TaskFilters
        filters={filters}
        categories={categories}
        onChange={changeFilter}
        onReset={() => setFilters({ ...EMPTY_FILTERS })}
      />

      {status === 'error' && (
        <div className="alert" role="alert">
          <p>Не удалось загрузить задачи с {apiBaseUrl}: {error.message}</p>
          <button type="button" onClick={refresh}>Повторить</button>
        </div>
      )}

      <p className="app__found" aria-live="polite">
        {isLoading ? 'Загрузка…' : `Найдено: ${tasks.length}`}
      </p>

      {/* Пока первая загрузка не завершилась, список не показываем, чтобы не мигала заглушка. */}
      {tasks.length > 0 || status === 'ready' ? (
        <TaskList
          tasks={tasks}
          categories={categories}
          isFiltered={isFiltered}
          editingId={editingId}
          disabled={pending}
          onToggle={toggleTask}
          onEdit={setEditingId}
          onDelete={handleDelete}
        />
      ) : null}
    </main>
  );
}
