import { useState } from 'react';
import { PRIORITY_LABELS, validateTaskDraft } from '../domain/task-service.js';

function createDraft(task) {
  return task
    ? { title: task.title, priority: task.priority, categoryId: String(task.categoryId) }
    : { title: '', priority: 'medium', categoryId: '' };
}

// Управляемая форма: значения полей живут в состоянии draft.
// Родитель меняет key формы, когда начинается редактирование другой задачи, — состояние создаётся заново.
export default function TaskForm({ task, categories, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => createDraft(task));
  const [errors, setErrors] = useState({});
  const isEditing = task !== null;

  function changeField(name, value) {
    setDraft(previous => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateTaskDraft(draft, categories);
    setErrors(result.errors);
    if (!result.valid) return;
    onSave(result.value);
    if (!isEditing) setDraft(createDraft(null));
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <h2>{isEditing ? 'Редактирование задачи' : 'Новая задача'}</h2>

      <label>
        Название
        <input
          value={draft.title}
          maxLength={150}
          aria-invalid={Boolean(errors.title)}
          onChange={event => changeField('title', event.target.value)}
        />
      </label>
      {errors.title && <p className="field-error">{errors.title}</p>}

      <label>
        Приоритет
        <select value={draft.priority} onChange={event => changeField('priority', event.target.value)}>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      {errors.priority && <p className="field-error">{errors.priority}</p>}

      <label>
        Категория
        <select
          value={draft.categoryId}
          aria-invalid={Boolean(errors.categoryId)}
          onChange={event => changeField('categoryId', event.target.value)}
        >
          <option value="">Выберите категорию</option>
          {categories.map(category => (
            <option key={category.id} value={String(category.id)}>{category.name}</option>
          ))}
        </select>
      </label>
      {errors.categoryId && <p className="field-error">{errors.categoryId}</p>}

      <div className="task-form__actions">
        <button type="submit">{isEditing ? 'Сохранить' : 'Добавить'}</button>
        {isEditing && <button type="button" className="button-secondary" onClick={onCancel}>Отмена</button>}
      </div>
    </form>
  );
}
