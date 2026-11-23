import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, categories, isFiltered, editingId, disabled, onToggle, onEdit, onDelete }) {
  // Фильтрация выполняется сервером, поэтому пустой ответ при активных фильтрах
  // означает «нет совпадений», а без фильтров — что задач нет вообще.
  if (tasks.length === 0) {
    return (
      <p className="task-list__empty">
        {isFiltered ? 'Задачи не найдены. Измените или сбросьте фильтры.' : 'Список задач пуст'}
      </p>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          categoryName={categories.find(category => category.id === task.categoryId)?.name ?? '—'}
          isEditing={task.id === editingId}
          disabled={disabled}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
