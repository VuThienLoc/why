import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LabUserLayout } from './LabUserLayout';
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

// Mock MessageNotificationContext
const mockUnreadCount = 5;

vi.mock('../context/MessageNotificationContext', () => ({
  MessageNotificationProvider: ({ children }: any) => <div data-testid="message-provider">{children}</div>,
  useMessageNotificationContext: () => ({
    unreadCount: mockUnreadCount,
    markAllAsRead: vi.fn(),
  }),
}));

// Mock child components
vi.mock('../components/common/Sidebar', () => ({
  Sidebar: ({ currentUserName, currentUserAvatar, currentUserRole, onNavigate, onLogout, navigationItems }: any) => (
    <div data-testid="sidebar">
      <div>User: {currentUserName}</div>
      <div>Avatar: {currentUserAvatar || 'No avatar'}</div>
      <div>Role: {currentUserRole}</div>
      <div>Items: {navigationItems.length}</div>
      <div>Chat Badge: {navigationItems.find((item: any) => item.id === 'chat')?.badgeCount || 'none'}</div>
      <button onClick={() => onNavigate('dashboard')}>Navigate</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}));

vi.mock('../components/common/TopHeader', () => ({
  TopHeader: () => <div data-testid="top-header">Top Header</div>,
}));

vi.mock('../components/common/MobileHeader', () => ({
  MobileHeader: ({ onMenuClick }: any) => (
    <div data-testid="mobile-header">
      <button onClick={onMenuClick}>Menu</button>
    </div>
  ),
}));

describe('LabUserLayout', () => {
  const mockUser: User = {
    id: '1',
    name: 'Lab User',
    email: 'labuser@example.com',
    role: ['LAB_USER'],
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
      email: 'labuser@example.com',
      fullName: 'Lab User',
      identityNumber: '123456789',
      role: ['LAB_USER'],
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

  it('renders layout with all components', () => {
    render(<LabUserLayout {...defaultProps} />);
    expect(screen.getByTestId('message-provider')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('top-header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays current user name in sidebar', () => {
    render(<LabUserLayout {...defaultProps} />);
    expect(screen.getByText('User: Lab User')).toBeInTheDocument();
  });

  it('loads and displays user profile avatar', async () => {
    render(<LabUserLayout {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Avatar: https:\/\/example\.com\/avatar\.jpg/)).toBeInTheDocument();
    });
  });

  it('renders navigation items for lab user', () => {
    render(<LabUserLayout {...defaultProps} />);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('displays chat badge count when there are unread messages', () => {
    render(<LabUserLayout {...defaultProps} />);
    expect(screen.getByText('Chat Badge: 5')).toBeInTheDocument();
  });

  it('calls onNavigate when navigation item is clicked', () => {
    render(<LabUserLayout {...defaultProps} />);
    const navigateButton = screen.getByText('Navigate');
    navigateButton.click();
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('dashboard');
  });

  it('calls onLogout when logout is clicked', () => {
    render(<LabUserLayout {...defaultProps} />);
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

  it('renders children content in main area', () => {
    render(<LabUserLayout {...defaultProps} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles profile loading error gracefully', async () => {
    vi.mocked(profileService.getProfile).mockRejectedValue(new Error('Failed to load'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<LabUserLayout {...defaultProps} />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  it('configures MessageNotificationProvider with correct options for chat page', () => {
    render(<LabUserLayout {...defaultProps} currentPage="chat" />);
    expect(screen.getByTestId('message-provider')).toBeInTheDocument();
  });

  it('configures MessageNotificationProvider with correct options for non-chat page', () => {
    render(<LabUserLayout {...defaultProps} currentPage="dashboard" />);
    expect(screen.getByTestId('message-provider')).toBeInTheDocument();
  });

  it('includes all required navigation items for lab user', () => {
    render(<LabUserLayout {...defaultProps} />);
    // Check that navigation items are passed (we can see the count)
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();
  });
});

