import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserStatistics } from './UserStatistics';
import type { UserStatistics as UserStatisticsType } from '../types/ManagerTypes';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('UserStatistics', () => {
  const mockStatistics: UserStatisticsType = {
    total: 100,
    active: 75,
    inactive: 25,
    byRole: {
      ADMIN: 5,
      MANAGER: 10,
      LAB_USER: 20,
      SERVICE: 15,
      USER: 50,
    },
  };

  it('renders all statistics cards', () => {
    render(<UserStatistics statistics={mockStatistics} />);
    
    expect(screen.getByText('manager.totalUsers')).toBeInTheDocument();
    expect(screen.getByText('manager.activeUsers')).toBeInTheDocument();
    expect(screen.getByText('manager.lockedUsers')).toBeInTheDocument();
  });

  it('displays correct total users count', () => {
    render(<UserStatistics statistics={mockStatistics} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('displays correct active users count', () => {
    render(<UserStatistics statistics={mockStatistics} />);
    const activeCard = screen.getByText('manager.activeUsers').closest('div');
    expect(activeCard).toHaveTextContent('75');
  });

  it('displays correct inactive users count', () => {
    render(<UserStatistics statistics={mockStatistics} />);
    const inactiveCard = screen.getByText('manager.lockedUsers').closest('div');
    expect(inactiveCard).toHaveTextContent('25');
  });

  it('renders with zero values', () => {
    const zeroStatistics: UserStatisticsType = {
      total: 0,
      active: 0,
      inactive: 0,
      byRole: {},
    };
    render(<UserStatistics statistics={zeroStatistics} />);
    
    // Check that all three cards show 0
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBe(3);
  });

  it('renders with large numbers', () => {
    const largeStatistics: UserStatisticsType = {
      total: 9999,
      active: 7500,
      inactive: 2499,
      byRole: {},
    };
    render(<UserStatistics statistics={largeStatistics} />);
    
    expect(screen.getByText('9999')).toBeInTheDocument();
  });

  it('renders all three stat cards', () => {
    render(<UserStatistics statistics={mockStatistics} />);
    // Check that all three statistics titles are present
    expect(screen.getByText('manager.totalUsers')).toBeInTheDocument();
    expect(screen.getByText('manager.activeUsers')).toBeInTheDocument();
    expect(screen.getByText('manager.lockedUsers')).toBeInTheDocument();
  });

  it('displays icons for each statistic', () => {
    const { container } = render(<UserStatistics statistics={mockStatistics} />);
    // Icons are rendered as SVG elements (lucide-react icons)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });
});

