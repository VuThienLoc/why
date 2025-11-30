import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserFilters } from './UserFilters';
import type { UserFilters as UserFiltersType } from '../types/ManagerTypes';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('UserFilters', () => {
  const defaultFilters: UserFiltersType = {
    searchTerm: '',
    role: 'all',
    status: 'all',
  };

  const mockOnFiltersChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter inputs', () => {
    render(<UserFilters filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.getByLabelText('manager.search')).toBeInTheDocument();
    expect(screen.getByLabelText('manager.role')).toBeInTheDocument();
    expect(screen.getByLabelText('manager.status')).toBeInTheDocument();
  });

  it('displays current filter values', () => {
    const filters: UserFiltersType = {
      searchTerm: 'test search',
      role: 'ADMIN',
      status: 'active',
    };
    render(<UserFilters filters={filters} onFiltersChange={mockOnFiltersChange} />);
    
    const searchInput = screen.getByPlaceholderText('manager.searchPlaceholder') as HTMLInputElement;
    expect(searchInput.value).toBe('test search');
    
    const roleSelect = screen.getByLabelText('manager.role') as HTMLSelectElement;
    expect(roleSelect.value).toBe('ADMIN');
    
    const statusSelect = screen.getByLabelText('manager.status') as HTMLSelectElement;
    expect(statusSelect.value).toBe('active');
  });

  it('calls onFiltersChange when search term changes', () => {
    render(<UserFilters filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);
    
    const searchInput = screen.getByPlaceholderText('manager.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'new search' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      searchTerm: 'new search',
    });
  });

  it('calls onFiltersChange when role changes', () => {
    render(<UserFilters filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);
    
    const roleSelect = screen.getByLabelText('manager.role');
    fireEvent.change(roleSelect, { target: { value: 'MANAGER' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      role: 'MANAGER',
    });
  });

  it('calls onFiltersChange when status changes', () => {
    render(<UserFilters filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);
    
    const statusSelect = screen.getByLabelText('manager.status');
    fireEvent.change(statusSelect, { target: { value: 'inactive' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      status: 'inactive',
    });
  });

  it('renders all role options', () => {
    render(<UserFilters filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);
    
    const roleSelect = screen.getByLabelText('manager.role');
    const options = Array.from(roleSelect.querySelectorAll('option'));
    const optionValues = options.map(opt => opt.value);
    
    expect(optionValues).toContain('all');
    expect(optionValues).toContain('ADMIN');
    expect(optionValues).toContain('MANAGER');
    expect(optionValues).toContain('LAB_USER');
    expect(optionValues).toContain('SERVICE');
    expect(optionValues).toContain('USER');
  });

  it('renders all status options', () => {
    render(<UserFilters filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);
    
    const statusSelect = screen.getByLabelText('manager.status');
    const options = Array.from(statusSelect.querySelectorAll('option'));
    const optionValues = options.map(opt => opt.value);
    
    expect(optionValues).toContain('all');
    expect(optionValues).toContain('active');
    expect(optionValues).toContain('inactive');
  });

  it('preserves other filter values when changing one', () => {
    const filters: UserFiltersType = {
      searchTerm: 'existing search',
      role: 'LAB_USER',
      status: 'active',
    };
    render(<UserFilters filters={filters} onFiltersChange={mockOnFiltersChange} />);
    
    const roleSelect = screen.getByLabelText('manager.role');
    fireEvent.change(roleSelect, { target: { value: 'SERVICE' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      searchTerm: 'existing search',
      role: 'SERVICE',
      status: 'active',
    });
  });

  it('displays filter icon and title', () => {
    render(<UserFilters filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.getByText('manager.filters')).toBeInTheDocument();
  });
});

