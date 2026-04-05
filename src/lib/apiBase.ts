const fallbackApiBase = import.meta.env.PROD
  ? 'https://api.film.bira.pizza'
  : 'http://localhost:8080';

export const API_BASE = (import.meta.env.PUBLIC_API_URL ?? fallbackApiBase)
  .split(',')
  .map((value: string) => value.trim())
  .find(Boolean) ?? fallbackApiBase;

export function buildApiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
