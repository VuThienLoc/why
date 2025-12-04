import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LoginLayout } from './LoginLayout';
import type { User } from '../types/User';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useAuthContext
const mockOnLogin = vi.fn();
let mockUser: User | null = null;
let mockLoading = false;

vi.mock('../hooks/useAuthContext', () => ({
  useAuthContext: () => ({
    user: mockUser,
    onLogin: mockOnLogin,
    loading: mockLoading,
  }),
}));

// Mock LoginForm
vi.mock('../pages/login/LoginForm', () => ({
  LoginForm: ({ onLogin, onShowRegister, onBackToHome }: any) => (
    <div data-testid="login-form">
      <button onClick={() => onLogin({ id: '1', name: 'Test', email: 'test@test.com', role: ['USER'], active: true, permissions: [] })}>
        Login
      </button>
      <button onClick={onShowRegister}>Show Register</button>
      <button onClick={onBackToHome}>Back to Home</button>
    </div>
  ),
}));

// Mock BubbleBackground
vi.mock('@/components/common/bubble-background', () => ({
  BubbleBackground: ({ className }: any) => (
    <div data-testid="bubble-background" className={className}>Bubble Background</div>
  ),
}));

describe('LoginLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks
    mockNavigate.mockClear();
    mockOnLogin.mockClear();
    // Reset mock variables
    mockUser = null;
    mockLoading = false;
  });

  it('renders login layout with form', () => {
    render(<LoginLayout />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders bubble background on left side', () => {
    render(<LoginLayout />);
    const bubbleBackground = screen.getByTestId('bubble-background');
    expect(bubbleBackground).toBeInTheDocument();
  });

  it('calls onLogin when login is successful', () => {
    render(<LoginLayout />);
    const loginButton = screen.getByText('Login');
    loginButton.click();
    expect(mockOnLogin).toHaveBeenCalled();
  });

  it('navigates to register when show register is clicked', () => {
    render(<LoginLayout />);
    const showRegisterButton = screen.getByText('Show Register');
    showRegisterButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('navigates to home when back to home is clicked', () => {
    render(<LoginLayout />);
    const backToHomeButton = screen.getByText('Back to Home');
    backToHomeButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays login title and subtitle', () => {
    render(<LoginLayout />);
    expect(screen.getByText('login.title1')).toBeInTheDocument();
    expect(screen.getByText('login.subtitle')).toBeInTheDocument();
  });

  it('displays login features', () => {
    render(<LoginLayout />);
    expect(screen.getByText('login.patientManagement')).toBeInTheDocument();
    expect(screen.getByText('login.reportAnalysis')).toBeInTheDocument();
    expect(screen.getByText('login.patientHistory')).toBeInTheDocument();
    expect(screen.getByText('login.highSecurity')).toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    const { container } = render(<LoginLayout />);
    
    // Check for main layout structure
    const mainDiv = container.querySelector('.min-h-screen.flex');
    expect(mainDiv).toBeInTheDocument();
  });

  it('renders left side with bubble background (hidden on mobile)', () => {
    const { container } = render(<LoginLayout />);
    
    // Left side should be hidden on mobile (lg:flex)
    const leftSide = container.querySelector('.hidden.lg\\:flex');
    expect(leftSide).toBeInTheDocument();
  });

  it('renders right side with login form', () => {
    const { container } = render(<LoginLayout />);
    
    // Right side should be visible
    const rightSide = container.querySelector('.w-full.lg\\:w-1\\/2');
    expect(rightSide).toBeInTheDocument();
  });

  it('does not redirect when user is null', () => {
    render(<LoginLayout />);
    // Should not navigate if user is null
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to admin page when user has ADMIN role', async () => {
    // Update mock variables
    mockUser = {
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: ['ADMIN'],
      active: true,
      permissions: [],
    };
    mockLoading = false;

    render(<LoginLayout />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
    
    // Reset
    mockUser = null;
  });

  it('redirects to manager page when user has MANAGER role', async () => {
    mockUser = {
      id: '1',
      name: 'Manager',
      email: 'manager@test.com',
      role: ['MANAGER'],
      active: true,
      permissions: [],
    };
    mockLoading = false;

    render(<LoginLayout />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/manager', { replace: true });
    });
    
    mockUser = null;
  });

  it('redirects to service page when user has SERVICE role', async () => {
    mockUser = {
      id: '1',
      name: 'Service',
      email: 'service@test.com',
      role: ['SERVICE'],
      active: true,
      permissions: [],
    };
    mockLoading = false;

    render(<LoginLayout />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/service', { replace: true });
    });
    
    mockUser = null;
  });

  it('redirects to labuser page when user has LAB_USER role', async () => {
    mockUser = {
      id: '1',
      name: 'Lab User',
      email: 'labuser@test.com',
      role: ['LAB_USER'],
      active: true,
      permissions: [],
    };
    mockLoading = false;

    render(<LoginLayout />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/labuser', { replace: true });
    });
    
    mockUser = null;
  });

  it('redirects to user page when user has USER role', async () => {
    mockUser = {
      id: '1',
      name: 'User',
      email: 'user@test.com',
      role: ['USER'],
      active: true,
      permissions: [],
    };
    mockLoading = false;

    render(<LoginLayout />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/user', { replace: true });
    });
    
    mockUser = null;
  });

  it('does not redirect when loading', () => {
    mockUser = null;
    mockLoading = true;

    render(<LoginLayout />);
    expect(mockNavigate).not.toHaveBeenCalled();
    
    mockLoading = false;
  });
});

