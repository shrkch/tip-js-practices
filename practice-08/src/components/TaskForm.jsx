import { useState } from 'react';
import { PRIORITY_LABELS } from '../constants.js';
import { validateTaskDraft } from '../form-validation.js';

function createDraft(task) {
  return task
    ? { title: task.title, priority: task.priority, categoryId: String(task.categoryId) }
    : { title: '', priority: 'medium', categoryId: '' };
}

// Ошибки полей: сначала клиентская проверка, затем details из ответа сервера 400.
export default function TaskForm({ task, categories, pending, serverError, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => createDraft(task));
  const [errors, setErrors] = useState({});
  const isEditing = task !== null;
  const isValidationError = serverError?.code === 'VALIDATION_ERROR';
  const fieldErrors = { ...(isValidationError ? serverError.details : {}), ...errors };

  function changeField(name, value) {
    setDraft(previous => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = validateTaskDraft(draft, categories);
    setErrors(result.errors);
    if (!result.valid) return;
    const saved = await onSave(result.value);
    if (saved && !isEditing) setDraft(createDraft(null));
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <h2>{isEditing ? 'Редактирование задачи' : 'Новая задача'}</h2>

      <label>
        Название
        <input
          value={draft.title}
          maxLength={150}
          aria-invalid={Boolean(fieldErrors.title)}
          onChange={event => changeField('title', event.target.value)}
        />
      </label>
      {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}

      <label>
        Приоритет
        <select value={draft.priority} onChange={event => changeField('priority', event.target.value)}>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      {fieldErrors.priority && <p className="field-error">{fieldErrors.priority}</p>}

      <label>
        Категория
        <select
          value={draft.categoryId}
          aria-invalid={Boolean(fieldErrors.categoryId)}
          onChange={event => changeField('categoryId', event.target.value)}
        >
          <option value="">Выберите категорию</option>
          {categories.map(category => (
            <option key={category.id} value={String(category.id)}>{category.name}</option>
          ))}
        </select>
      </label>
      {fieldErrors.categoryId && <p className="field-error">{fieldErrors.categoryId}</p>}

      {serverError && !isValidationError && <p className="field-error" role="alert">{serverError.message}</p>}

      <div className="task-form__actions">
        <button type="submit" disabled={pending}>
          {pending ? 'Сохранение…' : isEditing ? 'Сохранить' : 'Добавить'}
        </button>
        {isEditing && <button type="button" className="button-secondary" onClick={onCancel}>Отмена</button>}
      </div>
    </form>
  );
}
