import { buildApiUrl } from './apiBase';

function flattenHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...headers };
}

export function mergeHeaders(
  headers?: HeadersInit,
  extra?: Record<string, string>,
): Record<string, string> {
  return {
    ...flattenHeaders(headers),
    ...extra,
  };
}

export function withApiUrl(path: string): string {
  return buildApiUrl(path);
}

export function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  return fetch(withApiUrl(path), {
    ...init,
    credentials: 'include',
  });
}

export async function safeJson<T>(response: Response): Promise<T> {
  return response.json().catch(() => ({})) as Promise<T>;
}
