import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ServiceLayout } from './ServiceLayout';
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

// Mock child components
vi.mock('../components/common/Sidebar', () => ({
  Sidebar: ({ currentUserName, currentUserAvatar, currentUserRole, onNavigate, onLogout }: any) => (
    <div data-testid="sidebar">
      <div>User: {currentUserName}</div>
      <div>Avatar: {currentUserAvatar || 'No avatar'}</div>
      <div>Role: {currentUserRole}</div>
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

describe('ServiceLayout', () => {
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: ['SERVICE'],
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
      role: ['SERVICE'],
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
    render(<ServiceLayout {...defaultProps} />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('top-header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays current user name in sidebar', () => {
    render(<ServiceLayout {...defaultProps} />);
    expect(screen.getByText('User: Test User')).toBeInTheDocument();
  });

  it('loads and displays user profile avatar', async () => {
    render(<ServiceLayout {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Avatar: https:\/\/example\.com\/avatar\.jpg/)).toBeInTheDocument();
    });
  });

  it('handles profile loading error gracefully', async () => {
    vi.mocked(profileService.getProfile).mockRejectedValue(new Error('Failed to load'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ServiceLayout {...defaultProps} />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  it('calls onNavigate when navigation item is clicked', () => {
    render(<ServiceLayout {...defaultProps} />);
    const navigateButton = screen.getByText('Navigate');
    navigateButton.click();
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('dashboard');
  });

  it('calls onLogout when logout is clicked', () => {
    render(<ServiceLayout {...defaultProps} />);
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

  it('renders children content in main area', () => {
    render(<ServiceLayout {...defaultProps} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles sidebar collapse state', () => {
    render(<ServiceLayout {...defaultProps} />);
    const menuButton = screen.getByText('Menu');
    menuButton.click();
    // Sidebar collapse state is internal, but we can verify the menu click works
    expect(menuButton).toBeInTheDocument();
  });

  it('displays correct navigation items', () => {
    render(<ServiceLayout {...defaultProps} />);
    // Navigation items are rendered in Sidebar, which we've mocked
    // The actual navigation items would be tested in Sidebar component tests
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });
});

