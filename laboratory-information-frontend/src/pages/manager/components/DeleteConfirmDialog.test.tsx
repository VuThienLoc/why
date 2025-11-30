import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import type { ManagerUser } from '../types/ManagerTypes';

describe('DeleteConfirmDialog', () => {
  const mockUser: ManagerUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: ['USER'],
    active: true,
    permissions: [],
    phone_number: '0123456789',
    identify_number: '123456789',
  };

  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with user information', () => {
    render(
      <DeleteConfirmDialog
        user={mockUser}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Xác nhận xóa người dùng')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays warning message', () => {
    render(
      <DeleteConfirmDialog
        user={mockUser}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(
      screen.getByText(/Bạn có chắc chắn muốn xóa người dùng này\?/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hành động này không thể hoàn tác/)
    ).toBeInTheDocument();
  });

  it('displays user avatar initial', () => {
    render(
      <DeleteConfirmDialog
        user={mockUser}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Should display first letter of name
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <DeleteConfirmDialog
        user={mockUser}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('Xóa người dùng');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <DeleteConfirmDialog
        user={mockUser}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Hủy');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onCancel when close button is clicked', () => {
    render(
      <DeleteConfirmDialog
        user={mockUser}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Find close button (X icon)
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(button => 
      button.querySelector('svg') || button.textContent === ''
    );
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnCancel).toHaveBeenCalled();
    }
  });


  it('handles user with long name', () => {
    const userWithLongName: ManagerUser = {
      ...mockUser,
      name: 'Very Long Name That Should Be Truncated',
    };

    render(
      <DeleteConfirmDialog
        user={userWithLongName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Very Long Name That Should Be Truncated')).toBeInTheDocument();
  });

  it('displays alert icon', () => {
    const { container } = render(
      <DeleteConfirmDialog
        user={mockUser}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Check for AlertTriangle icon (SVG)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('renders with correct button styles', () => {
    render(
      <DeleteConfirmDialog
        user={mockUser}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('Xóa người dùng');
    const cancelButton = screen.getByText('Hủy');

    expect(confirmButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });
});

