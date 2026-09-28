import type { ApiErrorResponse } from '../types/api';

const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').trim().replace(/\/+$/, '');

export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: Record<string, string>;

  constructor(status: number, message: string, code?: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Builds the full URL, intelligently ensuring `/api` prefix is present when calling
 * standard backend endpoints if the base URL doesn't already contain `/api`.
 */
function resolveUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If the base URL already ends with /api, or the endpoint already starts with /api
  if (RAW_BASE_URL.endsWith('/api')) {
    const stripped = cleanEndpoint.startsWith('/api/') ? cleanEndpoint.substring(4) : cleanEndpoint;
    return `${RAW_BASE_URL}${stripped}`;
  }
  
  // Backend controllers in Spring Boot use @RequestMapping("/api/...")
  if (!cleanEndpoint.startsWith('/api')) {
    return `${RAW_BASE_URL}/api${cleanEndpoint}`;
  }
  
  return `${RAW_BASE_URL}${cleanEndpoint}`;
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = resolveUrl(endpoint);
  
  // Configure signal with 10s timeout
  let timeoutSignal: AbortSignal | undefined;
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    timeoutSignal = AbortSignal.timeout(10000);
  }

  const mergedSignal = options.signal || timeoutSignal;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: mergedSignal,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorCode: string | undefined;
      let errorDetails: Record<string, string> | undefined;

      try {
        const errorJson = (await response.json()) as ApiErrorResponse;
        if (errorJson.message) errorMessage = errorJson.message;
        if (errorJson.code) errorCode = errorJson.code;
        if (errorJson.details) errorDetails = errorJson.details;
      } catch {
        const rawText = await response.text().catch(() => '');
        if (rawText) errorMessage = rawText;
      }

      throw new ApiClientError(response.status, errorMessage, errorCode, errorDetails);
    }

    // 204 No Content response
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    
    // Connection refused / Network error
    const message = error instanceof Error ? error.message : 'Unknown network failure';
    throw new ApiClientError(0, `Cannot connect to backend at ${RAW_BASE_URL} (${message})`);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
