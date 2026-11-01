// КР2, задание 4: обработка HTTP-ошибки 404 через try/catch.
// Перед запуском: npm start (API ПР5 на http://127.0.0.1:5505/api).
import { ApiError, createApiClient } from "./src/api-client.js";
import { createTaskApi } from "./src/task-api.js";

const client = createApiClient({
  baseUrl: "http://127.0.0.1:5505/api",
  timeoutMs: 2000,
});
const api = createTaskApi(client);

try {
  const task = await api.getTaskById(999);
  console.log("Неожиданно получена задача:", task);
} catch (error) {
  if (error instanceof ApiError) {
    console.log("kind:", error.kind);
    console.log("status:", error.status);
    console.log("code:", error.code);
    console.log("message:", error.message);
  } else {
    throw error;
  }
}
