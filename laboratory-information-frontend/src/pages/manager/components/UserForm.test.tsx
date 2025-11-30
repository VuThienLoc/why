import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserForm } from './UserForm';
import type { ManagerUser } from '../types/ManagerTypes';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock validators
vi.mock('../types/validators', () => ({
  validateUserForm: vi.fn().mockResolvedValue({}),
}));

describe('UserForm', () => {
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
  };

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create mode', () => {
    it('renders form in create mode', () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      // Check for heading (h2) with create user text
      const heading = screen.getByRole('heading', { name: 'manager.createUser' });
      expect(heading).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      expect(screen.getByLabelText('manager.fullName')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('manager.password')).toBeInTheDocument();
      expect(screen.getByLabelText('manager.role')).toBeInTheDocument();
      expect(screen.getByLabelText('manager.phoneNumber')).toBeInTheDocument();
      expect(screen.getByLabelText('manager.identifyNumber')).toBeInTheDocument();
      expect(screen.getByLabelText('manager.gender')).toBeInTheDocument();
      expect(screen.getByLabelText('manager.dateOfBirth')).toBeInTheDocument();
      expect(screen.getByLabelText('manager.address')).toBeInTheDocument();
    });

    it('does not show active checkbox in create mode', () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.queryByLabelText('Tài khoản hoạt động')).not.toBeInTheDocument();
    });

    it('allows email input in create mode', () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      expect(emailInput).not.toBeDisabled();
    });
  });

  describe('Edit mode', () => {
    it('renders form in edit mode', () => {
      render(<UserForm mode="edit" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByText('manager.editUser')).toBeInTheDocument();
    });

    it('pre-fills form with user data', () => {
      render(<UserForm mode="edit" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const nameInput = screen.getByLabelText('manager.fullName') as HTMLInputElement;
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      const phoneInput = screen.getByLabelText('manager.phoneNumber') as HTMLInputElement;
      
      expect(nameInput.value).toBe('John Doe');
      expect(emailInput.value).toBe('john@example.com');
      expect(phoneInput.value).toBe('0123456789');
    });

    it('disables email input in edit mode', () => {
      render(<UserForm mode="edit" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      expect(emailInput).toBeDisabled();
    });

    it('shows active checkbox in edit mode', () => {
      render(<UserForm mode="edit" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      const activeCheckbox = screen.getByLabelText('Tài khoản hoạt động') as HTMLInputElement;
      expect(activeCheckbox).toBeInTheDocument();
      expect(activeCheckbox.checked).toBe(true);
    });

    it('allows password to be optional in edit mode', () => {
      render(<UserForm mode="edit" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      const passwordInput = screen.getByLabelText('manager.password') as HTMLInputElement;
      expect(passwordInput.placeholder).toContain('Để trống nếu không đổi');
    });
  });

  describe('View mode', () => {
    it('renders form in view mode', () => {
      render(<UserForm mode="view" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByText('manager.viewUser')).toBeInTheDocument();
    });

    it('disables all inputs in view mode', () => {
      render(<UserForm mode="view" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const nameInput = screen.getByLabelText('manager.fullName') as HTMLInputElement;
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      
      expect(nameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
    });

    it('does not show password field in view mode', () => {
      render(<UserForm mode="view" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.queryByLabelText('manager.password')).not.toBeInTheDocument();
    });

    it('does not show submit button in view mode', () => {
      render(<UserForm mode="view" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.queryByText('manager.createUser')).not.toBeInTheDocument();
      expect(screen.queryByText('manager.updateUser')).not.toBeInTheDocument();
      expect(screen.getByText('manager.close')).toBeInTheDocument();
    });

    it('does not submit form in view mode', async () => {
      render(<UserForm mode="view" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form interactions', () => {
    it('updates form field values on change', () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const nameInput = screen.getByLabelText('manager.fullName') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      
      expect(nameInput.value).toBe('Jane Doe');
    });

    it('clears error when field is changed', async () => {
      const { validateUserForm } = await import('../types/validators');
      vi.mocked(validateUserForm).mockResolvedValueOnce({ fullName: 'Họ tên là bắt buộc' });
      
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const nameInput = screen.getByLabelText('manager.fullName');
      const form = nameInput.closest('form');
      
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Họ tên là bắt buộc')).toBeInTheDocument();
      });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Họ tên là bắt buộc')).not.toBeInTheDocument();
      });
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const cancelButton = screen.getByText('manager.cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('calls onCancel when close button is clicked', () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      // Find close button by finding button with X icon or by its position
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(btn => btn.querySelector('svg'));
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnCancel).toHaveBeenCalled();
      }
    });
  });

  describe('Form submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const nameInput = screen.getByLabelText('manager.fullName');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('manager.password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const form = nameInput.closest('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('does not submit when validation fails', async () => {
      const { validateUserForm } = await import('../types/validators');
      vi.mocked(validateUserForm).mockResolvedValueOnce({ fullName: 'Họ tên là bắt buộc' });
      
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const form = screen.getByLabelText('manager.fullName').closest('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Họ tên là bắt buộc')).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('handles role selection', () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const roleSelect = screen.getByLabelText('manager.role') as HTMLSelectElement;
      fireEvent.change(roleSelect, { target: { value: 'ADMIN' } });
      
      expect(roleSelect.value).toBe('ADMIN');
    });

    it('handles gender selection', () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const genderSelect = screen.getByLabelText('manager.gender') as HTMLSelectElement;
      fireEvent.change(genderSelect, { target: { value: 'Female' } });
      
      expect(genderSelect.value).toBe('Female');
    });

    it('handles active checkbox toggle', () => {
      render(<UserForm mode="edit" user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const activeCheckbox = screen.getByLabelText('Tài khoản hoạt động') as HTMLInputElement;
      fireEvent.click(activeCheckbox);
      
      expect(activeCheckbox.checked).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('displays validation errors', async () => {
      const { validateUserForm } = await import('../types/validators');
      vi.mocked(validateUserForm).mockResolvedValueOnce({
        fullName: 'Họ tên là bắt buộc',
        email: 'Email không hợp lệ',
      });
      
      render(<UserForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const form = screen.getByLabelText('manager.fullName').closest('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Họ tên là bắt buộc')).toBeInTheDocument();
        expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument();
      });
    });
  });
});

