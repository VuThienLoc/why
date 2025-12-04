import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Profile, { type UserProfileData } from './Profile';
import type { User } from '../types/User';
import { profileService } from '../service/profileService';
import { toast } from 'sonner';

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

// Mock profileService
vi.mock('../service/profileService', () => ({
  profileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
  },
}));

describe('Profile', () => {
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: ['USER'],
    active: true,
    permissions: [],
  };

  const mockProfileData: UserProfileData = {
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
  };

  const defaultProps = {
    currentUser: mockUser,
    onUpdateProfile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(profileService.getProfile).mockResolvedValue(mockProfileData);
    vi.mocked(profileService.updateProfile).mockResolvedValue(undefined);
    vi.mocked(profileService.uploadAvatar).mockResolvedValue('https://example.com/new-avatar.jpg');
  });

  

  it('loads and displays profile data', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0123456789')).toBeInTheDocument();
  });

  it('displays error message when profile fails to load', async () => {
    vi.mocked(profileService.getProfile).mockRejectedValue(new Error('Failed to load'));
    
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('userProfile.loadProfileError')).toBeInTheDocument();
    });
  });

  it('enters edit mode when edit button is clicked', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('userProfile.editProfile');
    fireEvent.click(editButton);
    
    // Check that inputs are enabled (not disabled)
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).not.toBeDisabled();
    });
  });

  it('updates form data when input values change', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('userProfile.editProfile');
    fireEvent.click(editButton);
    
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    expect(nameInput).toHaveValue('Updated Name');
  });

  it('saves profile changes successfully', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('userProfile.editProfile');
    fireEvent.click(editButton);
    
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    const saveButton = screen.getByText('userProfile.saveChanges');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(profileService.updateProfile).toHaveBeenCalled();
    });
  });

  it('cancels editing and reverts changes', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('userProfile.editProfile');
    fireEvent.click(editButton);
    
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    const cancelButton = screen.getByText('userProfile.cancel');
    fireEvent.click(cancelButton);
    
    // Should revert to original value
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
  });

  it('handles avatar upload', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('userProfile.editProfile');
    fireEvent.click(editButton);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(profileService.uploadAvatar).toHaveBeenCalledWith(file);
    });
  });

  it('rejects non-image files for avatar upload', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('userProfile.editProfile');
    fireEvent.click(editButton);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('userProfile.avatarFileTypeError');
    });
  });

  it('rejects files larger than 5MB', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('userProfile.editProfile');
    fireEvent.click(editButton);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('userProfile.avatarFileSizeError');
    });
  });

  it('displays user status correctly', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('userProfile.active')).toBeInTheDocument();
    });
  });

  it('displays inactive status correctly', async () => {
    vi.mocked(profileService.getProfile).mockResolvedValue({
      ...mockProfileData,
      isActive: false,
    });
    
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('userProfile.inactive')).toBeInTheDocument();
    });
  });

  it('displays user roles correctly', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('USER')).toBeInTheDocument();
    });
  });

  it('handles profile update error', async () => {
    vi.mocked(profileService.updateProfile).mockRejectedValue({
      response: {
        data: {
          message: 'Update failed',
        },
      },
    });
    
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('userProfile.editProfile');
    fireEvent.click(editButton);
    
    const saveButton = screen.getByText('userProfile.saveChanges');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('calls onUpdateProfile callback after successful update', async () => {
    render(<Profile {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('userProfile.editProfile');
    fireEvent.click(editButton);
    
    const saveButton = screen.getByText('userProfile.saveChanges');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onUpdateProfile).toHaveBeenCalled();
    });
  });
});

