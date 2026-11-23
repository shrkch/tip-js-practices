export default function TaskStats({ stats }) {
  return (
    <dl className="stats">
      <div><dt>Всего</dt><dd>{stats.total}</dd></div>
      <div><dt>Выполнено</dt><dd>{stats.completed}</dd></div>
      <div><dt>В работе</dt><dd>{stats.active}</dd></div>
    </dl>
  );
}
