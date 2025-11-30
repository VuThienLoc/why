import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { apiUtils } from './apiClient';
import type { TestOrder } from '../pages/labuser/types/TestOrderTypes';

// Create a dedicated axios instance for TestOrder service (port 5002)
const TEST_ORDER_SERVICE_URL = import.meta.env.VITE_TEST_ORDER_SERVICE_URL || 'http://localhost:5002';
const testOrderApiClient: AxiosInstance = axios.create({
  baseURL: TEST_ORDER_SERVICE_URL,
  timeout: 10000,
  withCredentials: true, // Enable cookies for JWT authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// testOrderService.ts
const VALID_STATUSES = ['Pending', 'Processing', 'Completed'] as const;

const isValidStatus = (status: string): status is typeof VALID_STATUSES[number] => {
  return typeof status === 'string' && VALID_STATUSES.includes(status as typeof VALID_STATUSES[number]);
};

// Attach Authorization header like the global apiClient
testOrderApiClient.interceptors.request.use(
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

const TEST_ORDER_API_BASE_URL = '/api/testOrder';

// Backend API response type
interface BackendTestOrder {
  _id: string;
  patient_id: string;
  barcode: string;
  status: string;
  test_type: string
  created_at: string;
  created_by: string;
  due_date?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  processing?: number;
  notes?: string;
  patient_name?: string;
  test_item_ids?: string[];
  user?: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    age?: number;
  };  
  instrument?: {
    instrument_code: string;
    instrument_name: string;
    instrument_type: string;
    manufacturer: string;
    status: string;
  };
  reagents?: {
    reagent_id: string;
    reagent_name: string;
    reagent_type: string;
    status: string;
    quantity_used: number;
  }[];
}
interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
// Transform backend response to frontend format
const transformBackendOrder = (backendOrder: BackendTestOrder): TestOrder => {
  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };



  // Transform test_item_ids from ObjectId to string array
  const transformTestItemIds = (ids?: string[] | any[]): string[] | undefined => {
    if (!ids || !Array.isArray(ids)) return undefined;
    return ids.map(id => typeof id === 'string' ? id : id.toString());
  };

  // Normalize status to ensure consistent format (capitalize first letter)
  const normalizeStatus = (status?: string): string => {
    if (!status) return 'Pending';
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'Pending';
    if (statusLower === 'processing') return 'Processing';
    if (statusLower === 'completed') return 'Completed';
    return status; // Return as-is if unknown
  };

  return {
    _id: backendOrder._id,
    barcode: backendOrder.barcode,
    patient_name: backendOrder.patient_name || 'N/A',
    patient_id: backendOrder.patient_id,
    test_type: backendOrder.test_type,
    created_at: formatDate(backendOrder.created_at),
    created_by: backendOrder.user?.fullName,
    status: normalizeStatus(backendOrder.status),
    due_date: formatDate(backendOrder.due_date),
    is_deleted: backendOrder.is_deleted || undefined,
    deleted_at: backendOrder.deleted_at,
    deleted_by: backendOrder.deleted_by,
    notes: backendOrder.notes,
    test_item_ids: transformTestItemIds(backendOrder.test_item_ids),
    instrument: backendOrder.instrument ? {
      instrument_code: backendOrder.instrument.instrument_code,
      instrument_name: backendOrder.instrument.instrument_name,
      instrument_type: backendOrder.instrument.instrument_type,
      manufacturer: backendOrder.instrument.manufacturer,
      status: backendOrder.instrument.status,
    } : undefined,
    reagents: backendOrder.reagents ? backendOrder.reagents.map(reagent => ({
      reagent_id: reagent.reagent_id,
      reagent_name: reagent.reagent_name,
      reagent_type: reagent.reagent_type,
      status: reagent.status,
      quantity_used: reagent.quantity_used,
    })) : undefined,
  };
};



// TestOrder Service API
export const testOrderService = {
  // Get all test orders with pagination
  async getAllTestOrders(page: number = 1, limit: number = 10): Promise<{ orders: TestOrder[]; pagination: PaginationInfo }> {
    try {
      const response = await testOrderApiClient.get<PaginatedResponse<BackendTestOrder>>(
        `${TEST_ORDER_API_BASE_URL}/all`,
        {
          params: { page, limit }
        }
      );
      console.log("response", response.data);
      
      // Handle both paginated response and direct array response
      const ordersArray = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || []);
      
      const orders = ordersArray.map(transformBackendOrder);
      
      // Extract pagination info
      const paginationData = response.data.pagination;
      const pagination: PaginationInfo = {
        page: paginationData?.page ?? page,
        limit: paginationData?.limit ?? limit,
        total: paginationData?.total ?? orders.length,
        totalPages: paginationData?.totalPages ?? Math.ceil((paginationData?.total ?? orders.length) / limit)
      };
      
      return { orders, pagination };
    } catch (error) {
      console.error('Error fetching test orders:', error);
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },



  // Get test order by ID
  async getTestOrderById(_id: string): Promise<TestOrder | null> {
    try {
      const response = await testOrderApiClient.get<BackendTestOrder>(`${TEST_ORDER_API_BASE_URL}/${_id}`);
      console.log("response", response.data)
      return transformBackendOrder(response.data);
    } catch (error) {
      console.error('Error fetching test order:', error);
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  // Create new test order
  // testOrderService.ts
  async createTestOrder(orderData: Partial<TestOrder>): Promise<TestOrder> {
    console.log("orderData", orderData)
    try {
      if (!orderData.created_by) {
        throw new Error('created_by is required to create a test order');
      }
      
      const backendData: any = {
        ...orderData,
        status: (orderData.status && isValidStatus(orderData.status))
          ? orderData.status
          : 'Pending',
        created_by: orderData.created_by,
      };

      // Transform testType (camelCase) to test_type (snake_case) if needed
      // if ((orderData as any).testType) {
      //   // Use testType if test_type is not already set
      //   if (!backendData.test_type) {
      //     backendData.test_type = (orderData as any).testType;
      //   }
      //   // Always remove testType to avoid sending both fields
      //   delete backendData.testType;
      // }
      // // Ensure test_type is set from orderData.test_type if it exists
      // if (orderData.test_type) {
      //   backendData.test_type = orderData.test_type;
      // }

      if ((orderData as any).instruments && Array.isArray((orderData as any).instruments)) {
        const instruments = (orderData as any).instruments;
        if (instruments.length > 0) {
          // Take the first instrument's instrumentId (which is the _id)
          backendData.instrument_id = instruments[0].instrumentId;
        }
        delete backendData.instruments;
      }

      if ((orderData as any).reagents && Array.isArray((orderData as any).reagents)) {
        const reagents = (orderData as any).reagents;
        backendData.reagent_usages = reagents.map((r: { reagentId: string; quantity: number }) => ({
          reagent_id: r.reagentId,
          quantity_used: r.quantity || 1,
        }));
        delete backendData.reagents;
      }

      // Không gửi patient_id nếu nó rỗng hoặc không có giá trị
      if (!backendData.patient_id || (typeof backendData.patient_id === 'string' && backendData.patient_id.trim() === '')) {
        delete backendData.patient_id;
      }

      console.log('Sending to backend:', backendData); // DEBUG
 
      const response = await testOrderApiClient.post<BackendTestOrder>(
        `${TEST_ORDER_API_BASE_URL}/create`,
        backendData
      );

      return transformBackendOrder(response.data);
      
    } catch (error) {
      console.error('Error creating test order:', error);
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  // Update test order
  async updateTestOrder(id: string, orderData: Partial<TestOrder>): Promise<TestOrder> {
    try {
      // Transform frontend data to backend format
      const backendData: any = {
        ...orderData
      };



      if (orderData.status) {
        backendData.status = orderData.status.toLowerCase();
      }


      const response = await testOrderApiClient.put<BackendTestOrder>(
        `${TEST_ORDER_API_BASE_URL}/update/${id}`,
        backendData
      );
      return transformBackendOrder(response.data);
    } catch (error) {
      console.error('Error updating test order:', error);
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },


  async deleteTestOrder(id: string, deletedBy: string): Promise<void> {
    try {
      await testOrderApiClient.delete(
        `${TEST_ORDER_API_BASE_URL}/delete/${id}`,
        {
          data: { deleted_by: deletedBy },
        }
      );
    } catch (error) {
      console.error('Error deleting test order:', error);
      throw new Error('Lỗi server khi xóa test order');
    }
  },

  async changeStatus(
    id: string,
    status: 'Pending' | 'Processing' | 'Completed',
    updated_by: string
  ) {
    try {
      const response = await testOrderApiClient.put<{ success: boolean; data: BackendTestOrder }>(
        `${TEST_ORDER_API_BASE_URL}/${id}/status`,
        {
          status,
          updated_by,
        }
      );
      return transformBackendOrder(response.data.data);
    } catch (error) {
      console.error('Error updating test order status:', error);
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  // Search test orders with pagination
  async searchTestOrders(keyword: string, page: number = 1, limit: number = 10): Promise<{ orders: TestOrder[]; pagination: PaginationInfo }> {
    try {
      if (!keyword.trim()) {
        throw new Error('Keyword is required');
      }

      const response = await testOrderApiClient.get<PaginatedResponse<BackendTestOrder>>(
        `${TEST_ORDER_API_BASE_URL}/search`,
        {
          params: { keyword, page, limit }
        }
      );
      
      console.log("search response", response.data);
      
      const ordersArray = response.data.data || [];
      const orders = ordersArray.map(transformBackendOrder);
      
      // Extract pagination info
      const paginationData = response.data.pagination;
      const pagination: PaginationInfo = {
        page: paginationData?.page ?? page,
        limit: paginationData?.limit ?? limit,
        total: paginationData?.total ?? orders.length,
        totalPages: paginationData?.totalPages ?? Math.ceil((paginationData?.total ?? orders.length) / limit)
      };
      
      return { orders, pagination };
    } catch (error) {
      console.error('Error searching test orders:', error);
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

};
