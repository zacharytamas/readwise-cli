import { BASE_URL_DEFAULT } from "./constants";
import type { RequestOptions } from "./types";
import { extractErrorMessage, normalizeBaseUrl, safeJsonParse, toUrlSearchParams } from "./utils";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(
  method: string,
  path: string,
  options: RequestOptions,
  token: string
): Promise<unknown> {
  const baseUrl = normalizeBaseUrl(Bun.env.READWISE_API_BASE_URL ?? BASE_URL_DEFAULT);
  const url = new URL(path.replace(/^\//, ""), baseUrl);
  const params = toUrlSearchParams(options.query);
  if ([...params.keys()].length > 0) {
    url.search = params.toString();
  }

  const headers = new Headers({
    Authorization: `Token ${token}`,
    Accept: "application/json",
  });

  const body = options.body ? JSON.stringify(options.body) : undefined;
  if (body) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    const data = text.length > 0 ? safeJsonParse(text) : null;

    if (!response.ok) {
      const retryAfter = response.headers.get("Retry-After");
      const detail = extractErrorMessage(data) ?? text;
      const suffix = retryAfter ? ` Retry after ${retryAfter} seconds.` : "";
      throw new ApiError(`${detail || response.statusText}.${suffix}`.trim(), response.status, data);
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}
