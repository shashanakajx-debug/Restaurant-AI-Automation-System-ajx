/**
 * API utility functions
 */

import { ApiResponse, ApiError } from '@/types/api';

export function createApiResponse<T>(
  data?: T,
  message?: string,
  success = true
): ApiResponse<T> {
  return {
    success,
    data,
    message,
  };
}

export function createApiError(
  message: string,
  code?: string,
  details?: any
): ApiResponse<null> {
  return {
    success: false,
    error: message,
    message,
  };
}

export function isApiError(response: any): response is ApiError {
  return response && typeof response === 'object' && 'code' in response && 'message' in response;
}

export function handleApiError(error: any): ApiResponse<null> {
  console.error('API Error:', error);
  
  if (error.response?.data) {
    return createApiError(
      error.response.data.message || 'An error occurred',
      error.response.data.code
    );
  }
  
  if (error.message) {
    return createApiError(error.message);
  }
  
  return createApiError('An unexpected error occurred');
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

export function parseQueryString(queryString: string): Record<string, string | string[]> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string | string[]> = {};
  
  for (const [key, value] of params.entries()) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value);
      } else {
        result[key] = [result[key] as string, value];
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

export function getApiUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_API_URL || '';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function createHeaders(additionalHeaders?: Record<string, string>): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
  
  return headers;
}

export function createAuthHeaders(token: string, additionalHeaders?: Record<string, string>): HeadersInit {
  return createHeaders({
    Authorization: `Bearer ${token}`,
    ...additionalHeaders,
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await fn();
        resolve(result);
        return;
      } catch (error) {
        lastError = error as Error;
        
        if (i === maxRetries) {
          reject(lastError);
          return;
        }
        
        await delay(delayMs * Math.pow(2, i)); // Exponential backoff
      }
    }
  });
}

export function fetchWithRetry(arg0: string, arg1: { method: string; headers: { 'Content-Type': string; }; body: string; maxRetries: number; }) {
    throw new Error('Function not implemented.');
}
