import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, totalCount, categories, editingId, onToggle, onEdit, onDelete }) {
  // Условный рендеринг: пустой набор вообще и пустой результат фильтра — разные заглушки.
  if (totalCount === 0) {
    return <p className="task-list__empty">Список задач пуст</p>;
  }
  if (tasks.length === 0) {
    return <p className="task-list__empty">Задачи не найдены. Измените или сбросьте фильтры.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          categoryName={categories.find(category => category.id === task.categoryId)?.name ?? '—'}
          isEditing={task.id === editingId}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
