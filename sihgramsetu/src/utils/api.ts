// Resolves backend base URL, ensuring /api suffix is present whether VITE_API_URL has it or not
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (!envUrl) {
    return 'http://localhost:5000/api';
  }
  const cleaned = envUrl.trim().replace(/\/+$/, '');
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
};

const BASE_URL = getBaseUrl();

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
