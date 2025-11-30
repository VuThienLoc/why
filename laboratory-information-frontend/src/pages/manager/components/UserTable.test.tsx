import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserTable } from './UserTable';
import type { ManagerUser } from '../types/ManagerTypes';
import type { User } from '../../../types/User';
// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('UserTable', () => {
  const mockUser: ManagerUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: ['USER'],
    active: true,
    permissions: [],
    phone_number: '0123456789',
    identify_number: '123456789',
    gender: 'Male',
    date_of_birth: '1990-01-01',
    address: '123 Main St',
    lastLogin: '2024-01-01T10:00:00Z',
  };

  const mockUsers: ManagerUser[] = [mockUser];

  const defaultProps = {
    users: mockUsers,
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleLock: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no users', () => {
    render(<UserTable {...defaultProps} users={[]} />);
    expect(screen.getByText('manager.noUsersFound')).toBeInTheDocument();
    expect(screen.getByText('manager.noUsersFoundDescription')).toBeInTheDocument();
  });

  it('renders user table with user data', () => {
    render(<UserTable {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('0123456789')).toBeInTheDocument();
  });

  it('calls onView when view button is clicked', () => {
    render(<UserTable {...defaultProps} />);
    const viewButton = screen.getAllByTitle('manager.viewDetails')[0];
    fireEvent.click(viewButton);
    expect(defaultProps.onView).toHaveBeenCalledWith(mockUser);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<UserTable {...defaultProps} />);
    const editButton = screen.getAllByTitle('manager.edit')[0];
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockUser);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<UserTable {...defaultProps} />);
    const deleteButton = screen.getAllByTitle('manager.deleteUser')[0];
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockUser);
  });

  it('calls onToggleLock when lock button is clicked', () => {
    render(<UserTable {...defaultProps} />);
    const lockButton = screen.getAllByTitle('manager.lockAccount')[0];
    fireEvent.click(lockButton);
    expect(defaultProps.onToggleLock).toHaveBeenCalledWith(mockUser);
  });

  it('displays active status correctly', () => {
    render(<UserTable {...defaultProps} />);
    expect(screen.getByText('manager.active')).toBeInTheDocument();
  });

  it('displays inactive status correctly', () => {
    const inactiveUser = { ...mockUser, active: false };
    render(<UserTable {...defaultProps} users={[inactiveUser]} />);
    expect(screen.getByText('manager.inactive')).toBeInTheDocument();
  });

  it('handles array role correctly', () => {
    const userWithArrayRole: ManagerUser = { ...mockUser, role: ['ADMIN'] };
    render(<UserTable {...defaultProps} users={[userWithArrayRole]} />);
    expect(screen.getByText('manager.admin')).toBeInTheDocument();
  });

  it('handles string role correctly', () => {
    const userWithStringRole = { ...mockUser, role: ['MANAGER'] as User['role'] };
    render(<UserTable {...defaultProps} users={[userWithStringRole]} />);
    expect(screen.getByText('manager.manager')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(<UserTable {...defaultProps} />);
    // The date should be formatted in Vietnamese locale
    const dateElement = screen.getByText(/01\/01\/2024/);
    expect(dateElement).toBeInTheDocument();
  });

  it('displays "Chưa có" when lastLogin is not provided', () => {
    const userWithoutLogin = { ...mockUser, lastLogin: undefined };
    render(<UserTable {...defaultProps} users={[userWithoutLogin]} />);
    expect(screen.getByText('Chưa có')).toBeInTheDocument();
  });

  it('renders pagination controls when provided', () => {
    const paginationProps = {
      ...defaultProps,
      onFirstPage: vi.fn(),
      onPrevPage: vi.fn(),
      onNextPage: vi.fn(),
      onLastPage: vi.fn(),
      hasPrev: true,
      hasNext: true,
      pageLabel: 'Hiển thị 10 người dùng',
    };
    render(<UserTable {...paginationProps} />);
    expect(screen.getByText('Hiển thị 10 người dùng')).toBeInTheDocument();
    expect(screen.getByTitle('manager.firstPage')).toBeInTheDocument();
    expect(screen.getByTitle('manager.previousPage')).toBeInTheDocument();
    expect(screen.getByTitle('manager.nextPage')).toBeInTheDocument();
    expect(screen.getByTitle('manager.lastPage')).toBeInTheDocument();
  });

  it('calls pagination handlers correctly', () => {
    const paginationProps = {
      ...defaultProps,
      onFirstPage: vi.fn(),
      onPrevPage: vi.fn(),
      onNextPage: vi.fn(),
      onLastPage: vi.fn(),
      hasPrev: true,
      hasNext: true,
      pageLabel: 'Hiển thị 10 người dùng',
    };
    render(<UserTable {...paginationProps} />);
    
    fireEvent.click(screen.getByTitle('manager.firstPage'));
    expect(paginationProps.onFirstPage).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('manager.previousPage'));
    expect(paginationProps.onPrevPage).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('manager.nextPage'));
    expect(paginationProps.onNextPage).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('manager.lastPage'));
    expect(paginationProps.onLastPage).toHaveBeenCalled();
  });

  it('disables pagination buttons when hasPrev/hasNext is false', () => {
    const paginationProps = {
      ...defaultProps,
      onFirstPage: vi.fn(),
      onPrevPage: vi.fn(),
      onNextPage: vi.fn(),
      onLastPage: vi.fn(),
      hasPrev: false,
      hasNext: false,
      pageLabel: 'Hiển thị 10 người dùng',
    };
    render(<UserTable {...paginationProps} />);
    
    const firstPageButton = screen.getByTitle('manager.firstPage');
    const prevPageButton = screen.getByTitle('manager.previousPage');
    const nextPageButton = screen.getByTitle('manager.nextPage');
    const lastPageButton = screen.getByTitle('manager.lastPage');

    expect(firstPageButton).toBeDisabled();
    expect(prevPageButton).toBeDisabled();
    expect(nextPageButton).toBeDisabled();
    expect(lastPageButton).toBeDisabled();
  });

  it('handles user without avatar', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined };
    render(<UserTable {...defaultProps} users={[userWithoutAvatar]} />);
    // Should display initial letter
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('handles user with avatar', () => {
    const userWithAvatar = { ...mockUser, avatar: 'https://example.com/avatar.jpg' };
    render(<UserTable {...defaultProps} users={[userWithAvatar]} />);
    const avatarImg = screen.getByAltText('John Doe');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('handles missing user name gracefully', () => {
    const userWithoutName = { ...mockUser, name: '' };
    render(<UserTable {...defaultProps} users={[userWithoutName]} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('handles missing email gracefully', () => {
    const userWithoutEmail = { ...mockUser, email: '' };
    render(<UserTable {...defaultProps} users={[userWithoutEmail]} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});

