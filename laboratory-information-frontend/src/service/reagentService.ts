import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { apiUtils } from './apiClient';
import type { Reagent } from '../pages/LabUser/types/Reagent';

// Create a dedicated axios instance for Warehouse service
const WAREHOUSE_SERVICE_URL = import.meta.env.VITE_WAREHOUSE_SERVICE_URL || 'http://localhost:5003';
const reagentApiClient: AxiosInstance = axios.create({
  baseURL: WAREHOUSE_SERVICE_URL,
  timeout: 10000,
  withCredentials: true, // Enable cookies for JWT authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header
reagentApiClient.interceptors.request.use(
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

const REAGENT_API_BASE_URL = '/api/warehouse/reagents';

// Backend API response type (matching IReagent from backend)
interface BackendReagent {
  _id: string;
  reagent_code: string;
  reagent_name: string;
  reagent_type: string;
  quantity_current: number;
  unit_of_measure: string;
  usage_per_run: number;
  expiration_date: string | Date;
  received_date: string | Date;
  status: 'Available' | 'LowStock' | 'Expired' | 'Depleted';
  low_stock_threshold?: number;
  storage_location?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  created_by?: string;
  updated_by?: string;
  is_deleted?: boolean;
}

// Backend API response wrapper
interface BackendReagentResponse {
  success: boolean;
  data: BackendReagent | BackendReagent[];
  message?: string;
}

interface BackendReagentSearchResponse {
  success: boolean;
  data: BackendReagent[];
  pagination?: {
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
    limit?: number;
  };
  message?: string;
}

// Transform backend response to frontend format
const transformBackendReagent = (backendReagent: BackendReagent): Reagent => {
  // Map status from backend to frontend
  const mapStatus = (status: BackendReagent['status']): Reagent['status'] => {
    switch (status) {
      case 'Available':
        return 'Available';
      case 'LowStock':
        return 'Low Stock';
      case 'Expired':
        return 'Expired';
      case 'Depleted':
        return 'Depleted';
      default:
        return 'Available';
    }
  };

  // Format date to string (YYYY-MM-DD)
  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return new Date().toISOString().split('T')[0];
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  return {
    id: backendReagent._id,
    name: backendReagent.reagent_name,
    lotNumber: backendReagent.reagent_code,
    manufacturer: backendReagent.reagent_type, // Using reagent_type as manufacturer placeholder
    reagentType: backendReagent.reagent_type,
    unitOfMeasure: backendReagent.unit_of_measure,
    lowStockThreshold: backendReagent.low_stock_threshold,
    receivedDate: formatDate(backendReagent.received_date),
    expiryDate: formatDate(backendReagent.expiration_date),
    quantity: backendReagent.quantity_current,
    status: mapStatus(backendReagent.status),
    storageLocation: backendReagent.storage_location || '',
    usedInTests: [], // Backend doesn't provide this, leaving empty
    notes: `Unit: ${backendReagent.unit_of_measure}, Usage per run: ${backendReagent.usage_per_run}`,
    createdBy: backendReagent.created_by || 'system',
    createdAt: formatDate(backendReagent.created_at) + 'T00:00:00Z',
    updatedAt: formatDate(backendReagent.updated_at) + 'T00:00:00Z',
  };
};

// Reagent Service API
export const reagentService = {
  // Get all reagents
  async getAllReagents(): Promise<Reagent[]> {
    try {
      // Fetch all reagents by making multiple requests if needed
      // Start with a large limit to get all in one request
      let allReagents: BackendReagent[] = [];
      let page = 1;
      const limit = 1000; // Large limit to get all at once
      let hasMore = true;

      while (hasMore) {
        const response = await reagentApiClient.get<BackendReagentSearchResponse>(
          `${REAGENT_API_BASE_URL}/`,
          {
            params: {
              page,
              limit,
            },
          }
        );
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch reagents');
        }

        const reagents = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        
        // Filter out deleted reagents
        const activeReagents = reagents.filter(
          (r: BackendReagent) => !r.is_deleted
        );
        
        allReagents = [...allReagents, ...activeReagents];

        // Check if there are more pages
        const pagination = response.data.pagination;
        if (pagination && pagination.totalPages) {
          hasMore = page < pagination.totalPages;
          page++;
        } else {
          // If no pagination info, assume we got all if we got less than limit
          hasMore = activeReagents.length >= limit;
          page++;
        }
        
        // Safety check: if we got no results, stop
        if (activeReagents.length === 0) {
          hasMore = false;
        }
      }
      
      return allReagents.map(transformBackendReagent);
    } catch (error: any) {
      console.error('Error fetching reagents:', error);
      
      // Provide more specific error messages
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        throw new Error('Không thể kết nối đến Warehouse Service (port 5003). Vui lòng kiểm tra backend service đã chạy chưa.');
      }
      
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  // Get reagent by ID
  async getReagentById(id: string): Promise<Reagent | null> {
    try {
      const response = await reagentApiClient.get<BackendReagentResponse>(
        `${REAGENT_API_BASE_URL}/${id}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch reagent');
      }

      const reagent = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;

      if (!reagent || reagent.is_deleted) {
        return null;
      }

      return transformBackendReagent(reagent);
    } catch (error: any) {
      console.error('Error fetching reagent:', error);
      
      // Provide more specific error messages
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        throw new Error('Không thể kết nối đến Warehouse Service (port 5003). Vui lòng kiểm tra backend service đã chạy chưa.');
      }
      
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  async searchReagents(keyword: string, page = 1, limit = 10) {
    try {
      const response = await reagentApiClient.get<BackendReagentSearchResponse>(
        `${REAGENT_API_BASE_URL}/search`,
        {
          params: {
            keyword,
            page,
            limit,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to search reagents');
      }

      const activeReagents = (response.data.data || []).filter(
        (reagent: BackendReagent) => !reagent.is_deleted
      );

      return {
        items: activeReagents.map(transformBackendReagent),
        pagination: {
          totalItems: response.data.pagination?.totalItems ?? activeReagents.length,
          totalPages: response.data.pagination?.totalPages ?? 1,
          currentPage: response.data.pagination?.currentPage ?? page,
          limit,
        },
      };
    } catch (error: any) {
      console.error('Error searching reagents:', error);

      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        throw new Error('Không thể kết nối đến Warehouse Service (port 5003). Vui lòng kiểm tra backend service đã chạy chưa.');
      }

      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  // Transform frontend format to backend format
  transformToBackendFormat(reagent: Partial<Reagent>, userId?: string): Partial<BackendReagent> {
    // Map status from frontend to backend
    const mapStatusToBackend = (status?: Reagent['status']): BackendReagent['status'] => {
      switch (status) {
        case 'Available':
          return 'Available';
        case 'Low Stock':
          return 'LowStock';
        case 'Expired':
          return 'Expired';
        case 'Depleted':
          return 'Depleted';
        default:
          return 'Available';
      }
    };

    // Parse date string to Date
    const parseDate = (dateStr?: string): Date | undefined => {
      if (!dateStr) return undefined;
      try {
        // Handle both YYYY-MM-DD and ISO format
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? undefined : date;
      } catch {
        return undefined;
      }
    };

    // Ensure quantity_current has a value
    const quantity = typeof reagent.quantity === 'number' ? reagent.quantity : 0;

    const backendData: Partial<BackendReagent> = {
      reagent_name: reagent.name || '',
      reagent_type: reagent.reagentType || reagent.manufacturer || 'Unknown',
      unit_of_measure: reagent.unitOfMeasure || 'unit', // Default, can be updated if frontend provides
      usage_per_run: 1, // Default, can be updated if frontend provides
      expiration_date: parseDate(reagent.expiryDate) || new Date(),
      received_date: parseDate(reagent.receivedDate) || new Date(),
      status: mapStatusToBackend(reagent.status),
      storage_location: reagent.storageLocation || '',
      low_stock_threshold: reagent.lowStockThreshold,
    };

    backendData.quantity_current = quantity;

    if (!reagent.id) {
      backendData.reagent_code = reagent.lotNumber || '';
      backendData.created_by = userId;
    }

    return backendData;
  },

  // Create new reagent
  async createReagent(reagentData: Partial<Reagent>, userId?: string): Promise<Reagent> {
    try {
      const backendData = this.transformToBackendFormat(reagentData, userId);
      
      const response = await reagentApiClient.post<BackendReagentResponse>(
        `${REAGENT_API_BASE_URL}/`,
        backendData
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create reagent');
      }

      const reagent = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;

      return transformBackendReagent(reagent);
    } catch (error: any) {
      console.error('Error creating reagent:', error);
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        throw new Error('Không thể kết nối đến Warehouse Service (port 5003). Vui lòng kiểm tra backend service đã chạy chưa.');
      }
      
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  // Update reagent
  async updateReagent(id: string, reagentData: Partial<Reagent>, userId?: string): Promise<Reagent> {
    try {
      const backendData = this.transformToBackendFormat(reagentData, userId);
      
      const response = await reagentApiClient.put<BackendReagentResponse>(
        `${REAGENT_API_BASE_URL}/${id}`,
        backendData
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update reagent');
      }

      const reagent = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;

      return transformBackendReagent(reagent);
    } catch (error: any) {
      console.error('Error updating reagent:', error);
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        throw new Error('Không thể kết nối đến Warehouse Service (port 5003). Vui lòng kiểm tra backend service đã chạy chưa.');
      }
      
      // Handle HTTP error responses
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || `Failed to update reagent (${status})`;
        throw new Error(message);
      }
      
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  // Delete reagent (soft delete)
  async deleteReagent(id: string, userId?: string): Promise<void> {
    try {
      const response = await reagentApiClient.delete<{ message?: string; order?: any }>(
        `${REAGENT_API_BASE_URL}/${id}`,
        {
          data: { deleted_by: userId }
        }
      );
      
      // Backend returns { message, order } format on success (200)
      // Or { message } on error (404, 500)
      if (response.status === 200) {
        // Success - check if message contains success indicator
        if (response.data.message && !response.data.message.includes('thành công') && !response.data.message.includes('success')) {
          // If message exists but doesn't indicate success, might be an error
          console.warn('Delete response:', response.data);
        }
        // If status is 200, consider it successful
        return;
      } else {
        throw new Error(response.data.message || 'Failed to delete reagent');
      }
    } catch (error: any) {
      console.error('Error deleting reagent:', error);
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        throw new Error('Không thể kết nối đến Warehouse Service (port 5003). Vui lòng kiểm tra backend service đã chạy chưa.');
      }
      
      // Handle HTTP error responses
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || `Failed to delete reagent (${status})`;
        throw new Error(message);
      }
      
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },
};

