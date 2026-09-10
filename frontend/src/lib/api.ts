const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));

    let message: string;
    if (typeof error.detail === 'string') {
      message = error.detail;
    } else if (Array.isArray(error.detail)) {
      message = error.detail
        .map((e: Record<string, unknown>) => (typeof e === 'object' && e !== null && 'msg' in e ? String(e.msg) : JSON.stringify(e)))
        .join('; ');
    } else if (typeof error.detail === 'object' && error.detail !== null) {
      message = JSON.stringify(error.detail);
    } else {
      message = `HTTP ${response.status}`;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
