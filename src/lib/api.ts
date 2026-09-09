export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (options.body && !(options.body instanceof FormData) && !((headers as Record<string, string>)['Content-Type'])) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}
