import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RegisterLayout } from './RegisterLayout';

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

// Mock RegisterForm
vi.mock('../pages/register/RegisterForm', () => ({
  RegisterForm: ({ onBackToLogin, onBackToHome }: any) => (
    <div data-testid="register-form">
      <button onClick={onBackToLogin}>Back to Login</button>
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

describe('RegisterLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register layout with form', () => {
    render(<RegisterLayout />);
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('renders bubble background on left side', () => {
    render(<RegisterLayout />);
    const bubbleBackground = screen.getByTestId('bubble-background');
    expect(bubbleBackground).toBeInTheDocument();
  });

  it('navigates to login when back to login is clicked', () => {
    render(<RegisterLayout />);
    const backToLoginButton = screen.getByText('Back to Login');
    backToLoginButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to home when back to home is clicked', () => {
    render(<RegisterLayout />);
    const backToHomeButton = screen.getByText('Back to Home');
    backToHomeButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders with correct layout structure', () => {
    const { container } = render(<RegisterLayout />);
    
    // Check for main layout structure
    const mainDiv = container.querySelector('.min-h-screen.flex');
    expect(mainDiv).toBeInTheDocument();
  });

  it('renders left side with bubble background (hidden on mobile)', () => {
    const { container } = render(<RegisterLayout />);
    
    // Left side should be hidden on mobile (lg:flex)
    const leftSide = container.querySelector('.hidden.lg\\:flex');
    expect(leftSide).toBeInTheDocument();
  });

  it('renders right side with register form', () => {
    const { container } = render(<RegisterLayout />);
    
    // Right side should be visible
    const rightSide = container.querySelector('.w-full.lg\\:w-1\\/2');
    expect(rightSide).toBeInTheDocument();
  });

  it('displays register title and subtitle', () => {
    render(<RegisterLayout />);
    // These are translated, so we check for the translation keys
    expect(screen.getByText('register.title1')).toBeInTheDocument();
    expect(screen.getByText('register.subtitle')).toBeInTheDocument();
  });

  it('displays register features', () => {
    render(<RegisterLayout />);
    expect(screen.getByText('register.patientManagement')).toBeInTheDocument();
    expect(screen.getByText('register.reportAnalysis')).toBeInTheDocument();
    expect(screen.getByText('register.patientHistory')).toBeInTheDocument();
    expect(screen.getByText('register.highSecurity')).toBeInTheDocument();
  });
});

