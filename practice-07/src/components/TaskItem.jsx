import { PRIORITY_LABELS } from '../domain/task-service.js';

export default function TaskItem({ task, categoryName, isEditing, onToggle, onEdit, onDelete }) {
  const classes = ['task-card', task.completed && 'task-card--done', isEditing && 'task-card--editing']
    .filter(Boolean).join(' ');

  return (
    <li className={classes}>
      <div className="task-card__body">
        <h3 className="task-card__title">{task.title}</h3>
        <p className="task-card__meta">
          <span className={task.completed ? 'badge badge--done' : 'badge'}>
            {task.completed ? 'Выполнена' : 'В работе'}
          </span>
          <span>Приоритет: {PRIORITY_LABELS[task.priority]}</span>
          <span>Категория: {categoryName}</span>
        </p>
      </div>
      <div className="task-card__actions">
        <button type="button" onClick={() => onToggle(task.id)}>
          {task.completed ? 'Вернуть в работу' : 'Завершить'}
        </button>
        <button type="button" className="button-secondary" onClick={() => onEdit(task.id)}>Изменить</button>
        <button type="button" className="button-danger" onClick={() => onDelete(task)}>Удалить</button>
      </div>
    </li>
  );
}
