/**
 * HTTP Client Utility for making requests to other microservices
 */

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export class HttpClient {
  private static defaultTimeout = 5000; // 5 seconds

  static async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      };

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, { method: 'GET', headers });
  }

  static async post<T>(url: string, body: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, { method: 'POST', body, headers });
  }

  static async put<T>(url: string, body: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, { method: 'PUT', body, headers });
  }

  static async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, { method: 'DELETE', headers });
  }
}

export default HttpClient;
