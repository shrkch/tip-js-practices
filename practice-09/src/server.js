import { createApp } from './app.js';

const HOST = '127.0.0.1';
const port = Number(process.env.API_PORT ?? 5505);
// Флаг --with-create включает POST /api/tasks (КР3, задание 4). Обычный режим ПР9 — только чтение.
const allowCreate = process.argv.includes('--with-create');

if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error('API_PORT должен быть целым числом от 1024 до 65535.');
  process.exit(1);
}

const server = createApp({ allowCreate }).listen(port, HOST, () => {
  console.log(`API ПР9: http://${HOST}:${port}/api${allowCreate ? ' (POST /api/tasks включён)' : ''}`);
  console.log('Остановка: Ctrl+C');
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Порт ${port} уже занят.` : error.message);
  process.exitCode = 1;
});
