export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

function normalizeBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
    throw new TypeError("baseUrl должен быть непустой строкой.");
  }
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new TypeError(`baseUrl должен быть абсолютным адресом: «${baseUrl}».`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("baseUrl должен использовать http или https.");
  }
  if (url.search !== "" || url.hash !== "" || baseUrl.includes("?") || baseUrl.includes("#")) {
    throw new TypeError("baseUrl не должен содержать query или hash.");
  }
  // Убираем завершающие «/», чтобы при соединении с путём не появлялся двойной слеш.
  return url.href.replace(/\/+$/, "");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Создаёт URL относительно baseUrl и добавляет непустые параметры query.
// Значения кодируются средствами URL и URLSearchParams, а не вручную.
export function buildUrl(baseUrl, path, query = {}) {
  const base = normalizeBaseUrl(baseUrl);
  if (typeof path !== "string" || path.replace(/^\/+|\/+$/g, "") === "") {
    throw new TypeError("path должен быть непустым относительным путём.");
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//")) {
    throw new TypeError("path должен быть относительным.");
  }
  if (!isPlainObject(query)) {
    throw new TypeError("query должен быть обычным объектом.");
  }

  const url = new URL(`${base}/${path.replace(/^\/+|\/+$/g, "")}`);
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(name, String(value));
  }
  url.search = params.toString();
  return url.href;
}

function isJsonContentType(contentType) {
  const mediaType = (contentType ?? "").split(";")[0].trim().toLowerCase();
  return mediaType === "application/json" || mediaType.endsWith("+json");
}

// fetchFn передаётся явно, чтобы модуль можно было проверить без реальной сети.
// Возвращаемый объект: { requestJson(path, { query, signal, timeoutMs } = {}) }.
export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией.");
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должен быть положительным целым числом.");
  }
  const defaultTimeoutMs = timeoutMs;

  async function requestJson(path, { query = {}, signal, timeoutMs: requestTimeoutMs } = {}) {
    const url = buildUrl(normalizedBaseUrl, path, query);
    const effectiveTimeout = requestTimeoutMs ?? defaultTimeoutMs;
    if (!Number.isSafeInteger(effectiveTimeout) || effectiveTimeout <= 0) {
      throw new TypeError("timeoutMs должен быть положительным целым числом.");
    }

    // Сигнал тайм-аута объединяется с внешним сигналом отмены.
    const timeoutSignal = AbortSignal.timeout(effectiveTimeout);
    const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

    // 1. Сетевой этап: только получение Response.
    let response;
    try {
      response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: combinedSignal,
      });
    } catch (error) {
      if (signal?.aborted) {
        throw new ApiError("Запрос отменён.", { kind: "aborted", url, cause: error });
      }
      if (timeoutSignal.aborted) {
        throw new ApiError(`Превышено время ожидания ответа (${effectiveTimeout} мс).`, {
          kind: "timeout",
          url,
          cause: error,
        });
      }
      throw new ApiError("Не удалось связаться с сервером.", { kind: "network", url, cause: error });
    }

    if (!(response instanceof Response)) {
      throw new ApiError("fetchFn вернул значение, не являющееся Response.", {
        kind: "invalid-response",
        url,
      });
    }

    // 2. HTTP-ошибка: fetch не отклоняет промис для 4xx/5xx, поэтому статус проверяется явно.
    if (!response.ok) {
      let payload = null;
      try {
        if (isJsonContentType(response.headers.get("Content-Type"))) {
          payload = await response.json();
        }
      } catch {
        payload = null;
      }
      const apiError = isPlainObject(payload) && isPlainObject(payload.error) ? payload.error : null;
      throw new ApiError(
        typeof apiError?.message === "string" && apiError.message !== ""
          ? apiError.message
          : `Сервер вернул HTTP ${response.status}.`,
        {
          kind: "http",
          status: response.status,
          code: typeof apiError?.code === "string" ? apiError.code : null,
          details: apiError?.details ?? null,
          url,
        },
      );
    }

    // 3. Успешный ответ.
    if (response.status === 204) {
      return null;
    }
    if (!isJsonContentType(response.headers.get("Content-Type"))) {
      throw new ApiError("Сервер вернул ответ не в формате JSON.", {
        kind: "invalid-response",
        url,
      });
    }
    try {
      return await response.json();
    } catch (error) {
      throw new ApiError("Сервер вернул повреждённый JSON.", {
        kind: "invalid-response",
        url,
        cause: error,
      });
    }
  }

  return { requestJson };
}
