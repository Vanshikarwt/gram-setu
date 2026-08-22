// In production (Vercel), set VITE_API_URL to your Railway backend URL.
// In local development, it falls back to http://localhost:5000/api automatically.
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api';

export interface RequestOptions extends RequestInit {
  bodyData?: any;
}

export async function apiRequest<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('gramsetu_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.bodyData) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.bodyData);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  get: <T = any>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
    
  post: <T = any>(path: string, bodyData?: any, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', bodyData }),
    
  put: <T = any>(path: string, bodyData?: any, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PUT', bodyData }),
    
  delete: <T = any>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
