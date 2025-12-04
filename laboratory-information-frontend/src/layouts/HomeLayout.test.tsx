import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeLayout } from './HomeLayout';

// Mock home page components
vi.mock('../pages/home', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
  FeaturesSection: () => <div data-testid="features-section">Features Section</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AboutSection: ({ onShowLogin }: any) => (
    <div data-testid="about-section">
      <button onClick={onShowLogin}>Show Login</button>
    </div>
  ),
  ServicesSection: () => <div data-testid="services-section">Services Section</div>,
  FAQSection: () => <div data-testid="faq-section">FAQ Section</div>,
  ContactSection: () => <div data-testid="contact-section">Contact Section</div>,
  Footer: () => <div data-testid="footer">Footer</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HomeHeader: ({ onShowLogin, onShowRegister }: any) => (
    <div data-testid="home-header">
      <button onClick={onShowLogin}>Login</button>
      <button onClick={onShowRegister}>Register</button>
    </div>
  ),
}));

describe('HomeLayout', () => {
  const defaultProps = {
    onShowLogin: vi.fn(),
    onShowRegister: vi.fn(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockObserver: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockObserve: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockUnobserve: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDisconnect: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock IntersectionObserver
    mockObserve = vi.fn();
    mockUnobserve = vi.fn();
    mockDisconnect = vi.fn();
    
    // Create a proper class mock for IntersectionObserver
    mockObserver = class IntersectionObserver {
      observe = mockObserve;
      unobserve = mockUnobserve;
      disconnect = mockDisconnect;
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
        // Mock constructor - parameters not used in test
      }
    } as unknown as typeof IntersectionObserver;
    
    (globalThis as typeof globalThis & { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = mockObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all home page sections', () => {
    render(<HomeLayout {...defaultProps} />);
    
    expect(screen.getByTestId('home-header')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
    expect(screen.getByTestId('about-section')).toBeInTheDocument();
    expect(screen.getByTestId('services-section')).toBeInTheDocument();
    expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('calls onShowLogin when login button is clicked in header', () => {
    render(<HomeLayout {...defaultProps} />);
    const loginButton = screen.getByText('Login');
    loginButton.click();
    expect(defaultProps.onShowLogin).toHaveBeenCalled();
  });

  it('calls onShowRegister when register button is clicked in header', () => {
    render(<HomeLayout {...defaultProps} />);
    const registerButton = screen.getByText('Register');
    registerButton.click();
    expect(defaultProps.onShowRegister).toHaveBeenCalled();
  });

  it('calls onShowLogin when show login is clicked in about section', () => {
    render(<HomeLayout {...defaultProps} />);
    const showLoginButton = screen.getByText('Show Login');
    showLoginButton.click();
    expect(defaultProps.onShowLogin).toHaveBeenCalled();
  });


  it('cleans up IntersectionObserver on unmount', () => {
    const { unmount } = render(<HomeLayout {...defaultProps} />);
    unmount();
    
    // disconnect should be called when component unmounts
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('renders with correct layout structure', () => {
    const { container } = render(<HomeLayout {...defaultProps} />);
    
    // Check for main layout classes
    const mainDiv = container.querySelector('.relative.min-h-screen');
    expect(mainDiv).toBeInTheDocument();
  });

  it('renders background elements', () => {
    const { container } = render(<HomeLayout {...defaultProps} />);
    
    // Check for background gradient
    const background = container.querySelector('.absolute.inset-0');
    expect(background).toBeInTheDocument();
  });
});

