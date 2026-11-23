export const PRIORITY_LABELS = Object.freeze({ low: 'Низкий', medium: 'Средний', high: 'Высокий' });

export const STATUS_FILTERS = Object.freeze([
  Object.freeze({ value: '', label: 'Все' }),
  Object.freeze({ value: 'false', label: 'В работе' }),
  Object.freeze({ value: 'true', label: 'Завершенные' }),
]);

export const EMPTY_FILTERS = Object.freeze({ q: '', completed: '', priority: '', categoryId: '' });
