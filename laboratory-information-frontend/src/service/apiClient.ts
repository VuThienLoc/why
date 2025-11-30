import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};
// Tạo client
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // Không cần thêm header → cookie tự gửi
  client.interceptors.request.use(config => config);

  // Xử lý 401 + refresh token
  client.interceptors.response.use(
    res => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Suppress network errors trong development mode khi backend chưa chạy
      if (import.meta.env.DEV && 
          (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') &&
          originalRequest?.url?.includes('/user/me/roles')) {
        // Không log lỗi này, chỉ reject để AuthProvider xử lý
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        const url = originalRequest.url || '';
        const fullUrl = originalRequest.baseURL ? `${originalRequest.baseURL}${url}` : url;

        // Bỏ qua auth endpoints
        if (['/login', '/refresh-token', '/logout', '/register'].some(ep =>
          fullUrl.includes(ep) || url.includes(ep)
        )) {
          window.location.href = '/login';
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          }).then(() => client(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await client.post('/refresh-token');
          processQueue(null);
          isRefreshing = false;
          return client(originalRequest);
        } catch (err) {
          processQueue(err as AxiosError);
          isRefreshing = false;
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

// Generic API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Generic API methods
export class ApiService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance = apiClient) {
    this.client = client;
  }

  // GET request
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // POST request
  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // PUT request
  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // PATCH request
  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // DELETE request
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Handle errors consistently
  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('API Error:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
      });
    } else if (error instanceof Error) {
      console.error('API Error:', error.message);
    } else {
      console.error('Unknown API Error:', error);
    }
  }
}

// Create a default API service instance
export const apiService = new ApiService();

// Utility functions for common operations
export const apiUtils = {
  // Check if response is successful
  isSuccessResponse: (response: AxiosResponse | undefined): boolean => {
    return !!response && (response.status === 200 || response.status === 201);
  },

  // Extract error message from axios error
  getErrorMessage: (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      // Try to get message from various possible response structures
      const responseData = error.response?.data;
      
      // Handle different response formats
      if (responseData) {
        // Direct message
        if (typeof responseData.message === 'string') {
          return responseData.message;
        }
        // Nested error.message
        if (responseData.error && typeof responseData.error === 'object' && 'message' in responseData.error) {
          return String(responseData.error.message);
        }
        // Direct error string
        if (typeof responseData.error === 'string') {
          return responseData.error;
        }
        // Array of messages
        if (Array.isArray(responseData.message)) {
          return responseData.message.join(', ');
        }
      }
      
      // Fall back to axios error message
      return error.message || 'Có lỗi xảy ra';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Có lỗi xảy ra';
  },

  // Create standardized API response
  createResponse: <T>(success: boolean, message: string, data?: T): ApiResponse<T> => ({
    success,
    message,
    data,
  }),
};

// Export the axios instance for direct use if needed
export default apiClient;

