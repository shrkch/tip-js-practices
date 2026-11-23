// КР3, задание 4: проверка POST /api/tasks в режиме --with-create.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from './src/app.js';

let server, base;
before(async () => {
  server = createApp({ allowCreate: true }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}/api/tasks`;
});
after(() => new Promise(resolve => server.close(resolve)));

const post = body => fetch(base, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

for (const [name, body] of [
  ['title отсутствует', { priority: 'high', categoryId: 2 }],
  ['title из пробелов', { title: '   ', priority: 'high', categoryId: 2 }],
  ['title не строка', { title: 42, priority: 'high', categoryId: 2 }],
]) {
  test(`400 VALIDATION_ERROR: ${name}`, async () => {
    const response = await post(body);
    const json = await response.json();
    assert.equal(response.status, 400);
    assert.equal(json.error.code, 'VALIDATION_ERROR');
    assert.equal(typeof json.error.details.title, 'string');
  });
}

test('корректная задача создаётся: 201, title обрезан', async () => {
  const response = await post({ title: '  Новая  ', priority: 'low', categoryId: 1 });
  const json = await response.json();
  assert.equal(response.status, 201);
  assert.deepEqual(json.data, { id: 35, title: 'Новая', priority: 'low', categoryId: 1, completed: false });
});

test('после ошибок сервер продолжает отвечать', async () => {
  const response = await fetch(base + '?completed=true');
  assert.equal(response.status, 200);
});
