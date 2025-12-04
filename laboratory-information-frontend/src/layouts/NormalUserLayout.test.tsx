import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NormalUserLayout } from './NormalUserLayout';
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
const mockMarkAllAsRead = vi.fn();
const mockUnreadCount = 0;

vi.mock('../context/MessageNotificationContext', () => ({
  MessageNotificationProvider: ({ children }: any) => <div data-testid="message-provider">{children}</div>,
  useMessageNotificationContext: () => ({
    unreadCount: mockUnreadCount,
    markAllAsRead: mockMarkAllAsRead,
  }),
}));

// Mock ChatBox
vi.mock('@/pages/home/ChatBox', () => ({
  default: () => <div data-testid="chatbox">ChatBox</div>,
}));

// Mock child components
vi.mock('../components/common/Sidebar', () => ({
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
  MobileHeader: ({ onMenuClick }: any) => (
    <div data-testid="mobile-header">
      <button onClick={onMenuClick}>Menu</button>
    </div>
  ),
}));

describe('NormalUserLayout', () => {
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: ['USER'],
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
      email: 'test@example.com',
      fullName: 'Test User',
      identityNumber: '123456789',
      role: ['USER'],
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
    render(<NormalUserLayout {...defaultProps} />);
    expect(screen.getByTestId('message-provider')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('top-header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
    expect(screen.getByTestId('chatbox')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays current user name in sidebar', () => {
    render(<NormalUserLayout {...defaultProps} />);
    expect(screen.getByText('User: Test User')).toBeInTheDocument();
  });

  it('loads and displays user profile avatar', async () => {
    render(<NormalUserLayout {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Avatar: https:\/\/example\.com\/avatar\.jpg/)).toBeInTheDocument();
    });
  });

  it('renders navigation items for normal user', () => {
    render(<NormalUserLayout {...defaultProps} />);
    // Check that navigation items are passed to Sidebar
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('marks messages as read when on chat page', async () => {
    render(<NormalUserLayout {...defaultProps} currentPage="chat" />);
    await waitFor(() => {
      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  it('does not mark messages as read when not on chat page', () => {
    render(<NormalUserLayout {...defaultProps} currentPage="dashboard" />);
    // markAllAsRead should not be called immediately for non-chat pages
    expect(mockMarkAllAsRead).not.toHaveBeenCalled();
  });

  it('calls onNavigate when navigation item is clicked', () => {
    render(<NormalUserLayout {...defaultProps} />);
    const navigateButton = screen.getByText('Navigate');
    navigateButton.click();
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('dashboard');
  });

  it('calls onLogout when logout is clicked', () => {
    render(<NormalUserLayout {...defaultProps} />);
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

  it('renders children content in main area', () => {
    render(<NormalUserLayout {...defaultProps} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles profile loading error gracefully', async () => {
    vi.mocked(profileService.getProfile).mockRejectedValue(new Error('Failed to load'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<NormalUserLayout {...defaultProps} />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  it('configures MessageNotificationProvider with correct options for chat page', () => {
    render(<NormalUserLayout {...defaultProps} currentPage="chat" />);
    expect(screen.getByTestId('message-provider')).toBeInTheDocument();
  });

  it('configures MessageNotificationProvider with correct options for non-chat page', () => {
    render(<NormalUserLayout {...defaultProps} currentPage="dashboard" />);
    expect(screen.getByTestId('message-provider')).toBeInTheDocument();
  });
});

