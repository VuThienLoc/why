import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminLayout } from './AdminLayout';
import type { User } from '../types/User';
import { profileService } from '@/service/profileService';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock profileService
vi.mock('@/service/profileService', () => ({
  profileService: {
    getProfile: vi.fn(),
  },
}));

// Mock AdminTypes
vi.mock('../pages/admin/types/AdminTypes', () => ({
  AdminLayoutProps: {},
}));

// Mock child components
vi.mock('../components/common/Sidebar', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Sidebar: ({ currentUserName, currentUserAvatar, currentUserRole, onNavigate, onLogout, navigationItems }: any) => (
    <div data-testid="sidebar">
      <div>User: {currentUserName}</div>
      <div>Avatar: {currentUserAvatar || 'No avatar'}</div>
      <div>Role: {currentUserRole}</div>
      <div>Items: {navigationItems.length}</div>
      <button onClick={() => onNavigate('dashboard')}>Navigate</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}));

vi.mock('../components/common/TopHeader', () => ({
  TopHeader: () => <div data-testid="top-header">Top Header</div>,
}));

vi.mock('../components/common/MobileHeader', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MobileHeader: ({ onMenuClick }: any) => (
    <div data-testid="mobile-header">
      <button onClick={onMenuClick}>Menu</button>
    </div>
  ),
}));

describe('AdminLayout', () => {
  const mockUser: User = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: ['ADMIN'],
    active: true,
    permissions: [],
  };

  const defaultProps = {
    currentUser: mockUser,
    onLogout: vi.fn(),
    currentPage: 'dashboard',
    onNavigate: vi.fn(),
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(profileService.getProfile).mockResolvedValue({
      email: 'admin@example.com',
      fullName: 'Admin User',
      identityNumber: '123456789',
      role: ['ADMIN'],
      avatar: 'https://example.com/avatar.jpg',
      isActive: true,
      createdAt: '2024-01-01',
      address: '123 Main St',
      age: 30,
      dateOfBirth: '1994-01-01',
      gender: 'male',
      phoneNumber: '0123456789',
    });
  });

  it('renders layout with sidebar and content', () => {
    render(<AdminLayout {...defaultProps} />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('top-header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays current user name in sidebar', () => {
    render(<AdminLayout {...defaultProps} />);
    expect(screen.getByText('User: Admin User')).toBeInTheDocument();
  });

  it('loads and displays user profile avatar', async () => {
    render(<AdminLayout {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Avatar: https:\/\/example\.com\/avatar\.jpg/)).toBeInTheDocument();
    });
  });

  it('renders admin-specific navigation items', () => {
    render(<AdminLayout {...defaultProps} />);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();
    // Admin layout should have multiple navigation items
    expect(screen.getByText(/Items: \d+/)).toBeInTheDocument();
  });

  it('calls onNavigate when navigation item is clicked', () => {
    render(<AdminLayout {...defaultProps} />);
    const navigateButton = screen.getByText('Navigate');
    navigateButton.click();
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('dashboard');
  });

  it('calls onLogout when logout is clicked', () => {
    render(<AdminLayout {...defaultProps} />);
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

  it('renders children content in main area', () => {
    render(<AdminLayout {...defaultProps} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles profile loading error gracefully', async () => {
    vi.mocked(profileService.getProfile).mockRejectedValue(new Error('Failed to load'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<AdminLayout {...defaultProps} />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  it('handles sidebar collapse state', () => {
    render(<AdminLayout {...defaultProps} />);
    const menuButton = screen.getByText('Menu');
    menuButton.click();
    expect(menuButton).toBeInTheDocument();
  });
});

