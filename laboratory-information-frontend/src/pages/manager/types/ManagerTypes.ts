import type { User } from '../../../types/User';

// User management types for Manager role
export interface ManagerUser extends User {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Form data for creating/updating users
export interface UserFormData {
  fullName: string;
  email: string;
  password?: string;
  role: User['role'];
  phone_number: string;
  identify_number: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth: string;
  age?: number;
  address: string;
  active: boolean;
  avatar?: string;
}

// User filter options
export interface UserFilters {
  searchTerm: string;
  role: ('ADMIN' | 'MANAGER' | 'SERVICE' | 'LAB_USER' | 'USER') | 'all';
  status: 'all' | 'active' | 'inactive';
}

// User action types
export type UserAction = 'view' | 'create' | 'edit' | 'delete' | 'lock' | 'unlock';

// Modal state
export interface ModalState {
  isOpen: boolean;
  mode: 'view' | 'create' | 'edit';
  user: ManagerUser | null;
}

// API Response types
export interface UserApiResponse {
  success: boolean;
  message: string;
  data?: ManagerUser;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data?: {
    users: ManagerUser[];
    total: number;
    page: number;
    limit: number;
  };
}

// Validation errors
export interface ValidationErrors {
  [key: string]: string;
}

// User statistics
export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    [key: string]: number;
  };
}

