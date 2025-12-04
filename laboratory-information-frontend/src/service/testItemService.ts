import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { apiUtils } from './apiClient';

// Create a dedicated axios instance for TestOrder service (port 5002)
// TestItem is part of testOrderService
const TEST_ORDER_SERVICE_URL = import.meta.env.VITE_API_TEST_ORDER_SERVICE_URL || 'http://localhost:5002';
const testItemApiClient: AxiosInstance = axios.create({
  baseURL: TEST_ORDER_SERVICE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header
testItemApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers = config.headers || {};
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const TEST_ITEM_API_BASE_URL = '/api/testItem';

// Backend API response type (matching TestItem model from backend)
export interface BackendTestItem {
  _id: string;
  test_type: string;
  code: string;
  name: string;
  unit?: string;
  ref_min?: number;
  ref_max?: number;
  method?: string;
  created_at?: string;
  updated_at?: string;
}

// Backend API response wrapper
interface BackendTestItemResponse {
  success: boolean;
  data: BackendTestItem | BackendTestItem[];
  message?: string;
}

// Frontend TestItem type
export interface TestItem {
  _id: string;
  test_type: string;
  code: string;
  name: string;
  unit?: string;
  ref_min?: number;
  ref_max?: number;
  method?: string;
}

// Transform backend response to frontend format
const transformBackendTestItem = (backendItem: BackendTestItem): TestItem => {
  return {
    _id: backendItem._id,
    test_type: backendItem.test_type,
    code: backendItem.code,
    name: backendItem.name,
    unit: backendItem.unit,
    ref_min: backendItem.ref_min,
    ref_max: backendItem.ref_max,
    method: backendItem.method,
  };
};

// TestItem Service API
export const testItemService = {
  // Get all test items, optionally filtered by test_type
  async getAllTestItems(testType?: string): Promise<TestItem[]> {
    try {
      const params = testType ? { test_type: testType } : {};
      const response = await testItemApiClient.get<BackendTestItemResponse>(
        `${TEST_ITEM_API_BASE_URL}/all`,
        { params }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch test items');
      }

      const items = Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];
      
      return items.map(transformBackendTestItem);
    } catch (error: any) {
      console.error('Error fetching test items:', error);
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        throw new Error('Không thể kết nối đến Test Order Service (port 5002). Vui lòng kiểm tra backend service đã chạy chưa.');
      }
      
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  // Get test item by ID
  async getTestItemById(id: string): Promise<TestItem | null> {
    try {
      const response = await testItemApiClient.get<BackendTestItemResponse>(
        `${TEST_ITEM_API_BASE_URL}/${id}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch test item');
      }

      const item = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;

      if (!item) {
        return null;
      }

      return transformBackendTestItem(item);
    } catch (error: any) {
      console.error('Error fetching test item:', error);
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        throw new Error('Không thể kết nối đến Test Order Service (port 5002). Vui lòng kiểm tra backend service đã chạy chưa.');
      }
      
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },
};

