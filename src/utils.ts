import { EXIT_CODES } from "./constants";
import { exitWithError } from "./errors";
import type { RequestOptions } from "./types";

export function parseOptionalBoolean(value: unknown, flagName: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "" || normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }
  exitWithError(`Invalid value for ${flagName}; expected true or false.`, EXIT_CODES.usage);
}

export function parsePositiveInt(value: unknown, flagName: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    exitWithError(`Invalid value for ${flagName}; expected a positive integer.`, EXIT_CODES.usage);
  }
  return parsed;
}

export function parseCsvList(value: unknown): { values: string[]; provided: boolean } {
  if (value === undefined) {
    return { values: [], provided: false };
  }
  const items = Array.isArray(value) ? value : [value];
  const values = items
    .flatMap((item) => String(item).split(","))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return { values, provided: true };
}

export function normalizeStringArray(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  const items = Array.isArray(value) ? value : [value];
  return items.map((item) => String(item));
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export function toUrlSearchParams(query: RequestOptions["query"]): URLSearchParams {
  const params = new URLSearchParams();
  if (!query) {
    return params;
  }
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }
    params.append(key, String(value));
  }
  return params;
}

export function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function extractErrorMessage(data: unknown): string | undefined {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const message = record.detail ?? record.error ?? record.message;
    if (typeof message === "string") {
      return message;
    }
  }
  if (typeof data === "string") {
    return data;
  }
  return undefined;
}
