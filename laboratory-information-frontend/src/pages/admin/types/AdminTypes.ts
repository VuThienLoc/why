import type { User } from '../../../types/User';

// Admin user management types
export interface AdminUser extends User {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Form data for creating/updating users
export interface AdminUserFormData {
  fullName: string;
  email: string;
  password?: string;
  role: User['role'];
  phone_number: string;
  identify_number: string;
  gender: 'male' | 'female' | 'other';
  date_of_birth: string;
  age?: number;
  address: string;
  active: boolean;
}

// User filter options
export interface AdminUserFilters {
  searchTerm: string;
  role: User['role'] | 'all';
  status: 'all' | 'active' | 'inactive';
}

// User action types
export type AdminUserAction = 'view' | 'create' | 'edit' | 'delete' | 'lock' | 'unlock';

// Modal state
export interface AdminModalState {
  isOpen: boolean;
  mode: 'view' | 'create' | 'edit';
  user: AdminUser | null;
}

// API Response types
export interface AdminUserApiResponse {
  success: boolean;
  message: string;
  data?: AdminUser;
}

export interface AdminUsersListResponse {
  success: boolean;
  message: string;
  data?: {
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
  };
}

// Validation errors
export interface AdminValidationErrors {
  [key: string]: string;
}

// User statistics
export interface AdminUserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    [key: string]: number;
  };
}

// Admin layout props
export interface AdminLayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}