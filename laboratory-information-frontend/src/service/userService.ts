import { apiService } from './apiClient';
import type { ManagerUser, UserFormData } from '../pages/manager/types/ManagerTypes';
import axios from 'axios';

interface BackendUser {
  _id: string;
  email: string;
  fullName: string;
  identityNumber: string;
  gender: string;
  age: number;
  dateOfBirth: string;
  phoneNumber?: string;
  address?: string;
  isActive: boolean;
  role?: string[];
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  lastLogin?: string;
}

interface PaginationParams {
  limit?: number;
  cursor?: string;
  sortBy?: 'createdAt' | '_id' | 'fullName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

interface BackendPaginatedResponse<T> {
  data: T[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    limit: number;
    totalCount?: number;
  };
}

const transformBackendUser = (backendUser: BackendUser): ManagerUser => {
  let formattedDateOfBirth = '';
  if (backendUser.dateOfBirth) {
    try {
      const date = new Date(backendUser.dateOfBirth);
      if (!isNaN(date.getTime())) {
        formattedDateOfBirth = date.toISOString().split('T')[0]; 
      }
    } catch (error) {
      console.warn('Error formatting date of birth:', error);
    }
  }

  return {
    id: backendUser._id || '',
    name: backendUser.fullName || 'N/A',
    email: backendUser.email || 'N/A',
    role: Array.isArray(backendUser.role) && backendUser.role.length > 0
      ? (backendUser.role as ManagerUser['role'])
      : ['USER'],
    active: backendUser.isActive ?? true,
    lastLogin: backendUser.lastLogin || '', 
    permissions: [], 
    phone_number: backendUser.phoneNumber || '',
    identify_number: backendUser.identityNumber || '',
    gender: (() => {
      const gender = backendUser.gender;
      if (gender === 'male' || gender === 'Male') return 'Male';
      if (gender === 'female' || gender === 'Female') return 'Female';
      if (gender === 'other' || gender === 'Other') return 'Other';
      return 'Male'; 
    })(),
    age: backendUser.age || 0,
    address: backendUser.address || '',
    date_of_birth: formattedDateOfBirth,
    createdAt: backendUser.createdAt || '',
    updatedAt: backendUser.updatedAt || '',
    avatar: backendUser.avatar || '',
  };
};

const transformFrontendUser = (frontendUser: UserFormData) => {
  let calculatedAge = frontendUser.age;
  if (!calculatedAge || calculatedAge <= 0) {
    const today = new Date();
    const birthDate = new Date(frontendUser.date_of_birth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    calculatedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;
    calculatedAge = Math.max(calculatedAge, 1);
  }

  const backendData = {
    email: frontendUser.email,
    fullName: frontendUser.fullName,
    identityNumber: frontendUser.identify_number,
    gender: frontendUser.gender, 
    age: calculatedAge,
    dateOfBirth: new Date(frontendUser.date_of_birth),
    phoneNumber: frontendUser.phone_number,
    address: frontendUser.address,
    avatar: frontendUser.avatar,
    role: Array.isArray(frontendUser.role) && frontendUser.role.length > 0 
      ? frontendUser.role 
      : ['USER'],
    ...(frontendUser.password && { password: frontendUser.password }),
  };
  
  return backendData;
};

export class UserService {
  async getAllUsers(): Promise<ManagerUser[]> {
    try {
      const { users } = await this.getUsersWithPagination({
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Không thể tải danh sách người dùng');
    }
  }

  async getUsersWithPagination(params: PaginationParams = {}): Promise<{
    users: ManagerUser[];
    pagination: {
      limit: number;
      cursor?: string;
      hasNext: boolean;
      total?: number;
    };
  }> {
    try {
      // Tạo query parameters từ PaginationParams
      const queryParams = new URLSearchParams();
      
      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.cursor) {
        queryParams.append('cursor', params.cursor);
      }
      if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/user/all?${queryString}` : '/user/all';
      
      const response = await apiService.get<BackendPaginatedResponse<BackendUser>>(endpoint);

      const mappedPagination = {
        limit: response.pagination.limit,
        cursor: response.pagination.nextCursor,
        hasNext: response.pagination.hasNextPage,
        total: response.pagination.totalCount,
      } as const;

      return {
        users: response.data.map(transformBackendUser),
        pagination: mappedPagination
      };
    } catch (error) {
      console.error('Error fetching users with pagination:', error);
      throw new Error('Không thể tải danh sách người dùng');
    }
  }

  async getUserById(userId: string): Promise<ManagerUser> {
    try {
      const response = await apiService.get<BackendUser>(`/user/${userId}`);
      return transformBackendUser(response);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Không thể tải thông tin người dùng');
    }
  }


  async getMyProfile(): Promise<ManagerUser> {
    try {
      const response = await apiService.get<BackendUser>('/user/profile');
      return transformBackendUser(response);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Không thể tải hồ sơ người dùng');
    }
  }

  async checkEmailExists(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const { users } = await this.getUsersWithPagination({ limit: 100 });
      return users.some(user =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.id !== excludeUserId
      );
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  async checkIdentityNumberExists(identityNumber: string, excludeUserId?: string): Promise<boolean> {
    try {
      const { users } = await this.getUsersWithPagination({ limit: 100 });
      return users.some(user => user.identify_number === identityNumber && user.id !== excludeUserId);
    } catch (error) {
      console.error('Error checking identity number:', error);
      return false;
    }
  }

  
  async createUser(userData: UserFormData): Promise<ManagerUser> {
    try {
      console.log('Creating user with data:', userData);
      const backendData = transformFrontendUser(userData);
      console.log('Sending to API:', backendData);
      const response = await apiService.post<BackendUser>('/user/create', backendData);
      return transformBackendUser(response);
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        // Kiểm tra lỗi duplicate key từ MongoDB (E11000)
        if (errorData?.message?.includes('E11000') && errorData?.message?.includes('email_1 dup key')) {
          throw new Error('Email đã đăng kí');
        } else if (errorData?.message?.includes('E11000') && errorData?.message?.includes('identityNumber_1 dup key')) {
          throw new Error('CMND/CCCD đã đăng kí');
        }
      }
      throw new Error('Không thể tạo người dùng');
    }
  }

  async updateUser(userId: string, userData: UserFormData): Promise<ManagerUser> {
    try {
      const backendData = transformFrontendUser(userData);
      const response = await apiService.put<BackendUser>(`/user/update/${userId}`, backendData);
      return transformBackendUser(response);
    } catch (error: unknown) {
      console.error('Error updating user:', error);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const errorMessage = error.response.data?.message || '';
        if (errorMessage.includes('email')) {
          throw new Error('Email đã đăng kí');
        } else if (errorMessage.includes('identityNumber')) {
          throw new Error('CMND/CCCD đã đăng kí');
        }
      }
      throw new Error('Không thể cập nhật người dùng');
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await apiService.delete(`/user/delete/${userId}`);
      return true;
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          throw new Error('Người dùng không tồn tại');
        }
      }
      throw new Error('Không thể xóa người dùng');
    }
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<ManagerUser> {
    try {
      const backendData = {
        isActive: isActive,
      };
      
      const response = await apiService.put<BackendUser>(`/user/update/${userId}`, backendData);
      return transformBackendUser(response);
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw new Error('Không thể thay đổi trạng thái người dùng');
    }
  }

  async getLabUsers(params: PaginationParams = {}): Promise<{
    users: ManagerUser[];
    pagination: {
      limit: number;
      cursor?: string;
      hasNext: boolean;
      total?: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.cursor) {
        queryParams.append('cursor', params.cursor);
      }
      if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/user/staff?${queryString}` : '/user/staff';
      
      const response = await apiService.get<BackendPaginatedResponse<BackendUser>>(endpoint);

      const mappedPagination = {
        limit: response.pagination.limit,
        cursor: response.pagination.nextCursor,
        hasNext: response.pagination.hasNextPage,
        total: response.pagination.totalCount,
      } as const;

      return {
        users: response.data.map(transformBackendUser),
        pagination: mappedPagination
      };
    } catch (error) {
      console.error('Error fetching lab users:', error);
      throw new Error('Không thể tải danh sách nhân viên phòng thí nghiệm');
    }
  }

  async getAllLabUsers(): Promise<ManagerUser[]> {
    try {
      const allUsers: ManagerUser[] = [];
      let cursor: string | undefined = undefined;
      let hasNext = true;

      while (hasNext) {
        const result = await this.getLabUsers({
          limit: 100,
          cursor,
          sortBy: 'fullName',
          sortOrder: 'asc'
        });
        
        allUsers.push(...result.users);
        cursor = result.pagination.cursor;
        hasNext = result.pagination.hasNext;
      }

      return allUsers;
    } catch (error) {
      console.error('Error fetching all lab users:', error);
      throw new Error('Không thể tải danh sách nhân viên phòng thí nghiệm');
    }
  }
}

export const userService = new UserService();
