
import { apiService } from './apiClient';

interface UserProfileData {
  email: string;
  fullName: string;
  identityNumber: string;
  role: string[];
  avatar: string;
  isActive: boolean;
  createdAt: string;
  address: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
}

interface UpdateProfileData extends Partial<UserProfileData> {
  _id?: string;
  updatedAt?: string;
  __v?: number;
  password?: string;
}

export class ProfileService {
  /**
   * Fetch user profile
   */
  async getProfile(userId: string): Promise<UserProfileData> {
    try {
      const response = await apiService.get<{ user: UserProfileData }>(`/user/profile/${userId}`);
      if (response && response.user) {
        return response.user;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      throw error;
    }
  }

  /**
   * Get current authenticated user profile
   * Uses the /user/profile/me endpoint to get the current user's profile including avatar
   */
  async getCurrentUserProfile(): Promise<UserProfileData> {
    try {
      const response = await apiService.get<{ user: UserProfileData }>("/user/profile/me");
      if (response && response.user) {
        return response.user;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error("Failed to fetch current user profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   * Prepares and validates data before sending to API
   */
  async updateProfile(formData: Partial<UserProfileData>): Promise<void> {
    try {
      
      // Prepare data for update (remove email as it's not updatable usually, or backend handles it)
      const updateData: UpdateProfileData = { ...formData };
      
      // Remove fields that are not allowed in the update payload
      delete updateData._id;
      delete updateData.updatedAt;
      delete updateData.__v;
      delete updateData.role; 
      delete updateData.createdAt;
      delete updateData.isActive;
      delete updateData.password;

      // Clean up data
      if (!updateData.dateOfBirth) {
        delete updateData.dateOfBirth;
      }
      if (updateData.age === undefined || updateData.age === null || isNaN(updateData.age)) {
        delete updateData.age;
      }
      if (!updateData.phoneNumber) {
        delete updateData.phoneNumber;
      }

      // Normalize gender to Title Case if present
      if (updateData.gender) {
        updateData.gender = updateData.gender.charAt(0).toUpperCase() + updateData.gender.slice(1).toLowerCase();
      }

      // Auto-fix identity number (CCCD/CMND) if user forgot leading zero
      if (updateData.identityNumber) {
        const cleanId = updateData.identityNumber.trim();
        // If 11 digits, assume 12-digit CCCD missing leading 0
        if (cleanId.length === 11 && /^\d+$/.test(cleanId)) {
          updateData.identityNumber = '0' + cleanId;
        }
        // If 8 digits, assume 9-digit CMND missing leading 0
        else if (cleanId.length === 8 && /^\d+$/.test(cleanId)) {
          updateData.identityNumber = '0' + cleanId;
        }
      }
      console.log("Updating profile with data:", updateData);

      await apiService.put("/user/profile", updateData);
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  /**
   * Upload user avatar
   * Uploads an image file as the user's avatar
   * @param file - The image file to upload (max 5MB, image/*)
   * @returns The URL of the uploaded avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append('avatar', file);

      // Make POST request with FormData
      // Note: axios will automatically detect FormData and set Content-Type with boundary
      // We override the default 'application/json' header by deleting it
      const response = await apiService.post<{ message: string; avatarUrl: string }>(
        "/user/profile/avatar",
        formData,
        {
          headers: {
            'Content-Type': undefined, // Delete to let axios set it automatically
          },
        }
      );

      if (response && response.avatarUrl) {
        return response.avatarUrl;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      throw error;
    }
  }

  
}

export const profileService = new ProfileService();

