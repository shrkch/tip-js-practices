import { PRIORITY_LABELS, STATUS_FILTERS } from '../constants.js';

export default function TaskFilters({ filters, categories, onChange, onReset }) {
  return (
    <section className="filters" aria-label="Фильтры">
      <div className="filters__status" role="group" aria-label="Статус">
        {STATUS_FILTERS.map(option => {
          const active = filters.completed === option.value;
          return (
            <button
              key={option.label}
              type="button"
              className={active ? 'filter-button filter-button--active' : 'filter-button'}
              aria-pressed={active}
              onClick={() => onChange('completed', option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <label>
        Поиск
        <input
          type="search"
          value={filters.q}
          placeholder="Часть названия"
          onChange={event => onChange('q', event.target.value)}
        />
      </label>

      <label>
        Приоритет
        <select value={filters.priority} onChange={event => onChange('priority', event.target.value)}>
          <option value="">Любой</option>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      <label>
        Категория
        <select value={filters.categoryId} onChange={event => onChange('categoryId', event.target.value)}>
          <option value="">Любая</option>
          {categories.map(category => (
            <option key={category.id} value={String(category.id)}>{category.name}</option>
          ))}
        </select>
      </label>

      <button type="button" className="button-secondary" onClick={onReset}>Сбросить фильтры</button>
    </section>
  );
}
