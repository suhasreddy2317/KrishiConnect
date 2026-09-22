const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;
const TIMEOUT_MS = 15000;

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function extractMessage(error: unknown, status: number): string {
  const payload = error as { detail?: unknown };
  if (payload && payload.detail !== undefined) {
    const detail = payload.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((e: Record<string, unknown>) => (typeof e === 'object' && e !== null && 'msg' in e ? String(e.msg) : JSON.stringify(e)))
        .join('; ');
    }
    if (typeof detail === 'object' && detail !== null) return JSON.stringify(detail);
  }
  return `HTTP ${status}`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ detail: 'Request failed' }));
        const message = extractMessage(errorPayload, response.status);

        if (
          attempt < MAX_RETRIES &&
          RETRYABLE_STATUS_CODES.has(response.status)
        ) {
          await new Promise(resolve => setTimeout(resolve, BASE_DELAY_MS * 2 ** attempt));
          continue;
        }

        throw new Error(message);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error('Unknown error');

      if (
        attempt < MAX_RETRIES &&
        (lastError.name === 'TypeError' || lastError.name === 'AbortError')
      ) {
        await new Promise(resolve => setTimeout(resolve, BASE_DELAY_MS * 2 ** attempt));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error('Request failed');
}
