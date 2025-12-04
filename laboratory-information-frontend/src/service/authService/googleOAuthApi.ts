import { apiService, apiUtils } from "../apiClient";
import type { User } from "../../types/User";

export interface GoogleOAuthResponse {
  message: string;
  accessToken: string; // JWT access token from backend
  refreshToken: string; // JWT refresh token from backend
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string[]; // Array of roles
    provider: string;
    avatar?: string;
  };
  redirectTo: string;
}

/**
 * Khởi tạo Google OAuth login
 * Redirect user đến Google OAuth page
 */
export function initiateGoogleLogin(returnTo: string = '/'): void {
  const baseUrl = import.meta.env.VITE_API_IAM_SERVICE_URL|| 'http://localhost:3000/api';
  // Kiểm tra xem baseUrl đã có /api chưa để tránh duplicate
  const googleLoginUrl = `${baseUrl}/google?returnTo=${encodeURIComponent(returnTo)}`;
  
  // Redirect to Google OAuth
  window.location.href = googleLoginUrl;
}

/**
 * Xử lý Google OAuth callback
 * Được gọi sau khi user quay lại từ Google OAuth
 */
export async function handleGoogleCallback(): Promise<User | null> {
  try {
    // Lấy URL parameters từ callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (!code) {
      throw new Error('Authorization code not found');
    }

    // Gọi backend endpoint callback để xử lý
    const response = await apiService.get<GoogleOAuthResponse>('/google/callback', {
      params: { code, state }
    });

    if (response?.user) {
      // Save accessToken to localStorage
      if (response.accessToken) {
        localStorage.setItem('authToken', response.accessToken);
        console.log('[Google OAuth] Access token saved to localStorage');
      }

      // Save refreshToken to localStorage (optional, for future use)
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
        console.log('[Google OAuth] Refresh token saved to localStorage');
      }

      // Mapping dữ liệu từ Google OAuth response sang User type
      const googleUser = response.user;
      
      const user: User = {
        id: googleUser.id,
        name: googleUser.fullName,
        email: googleUser.email,
        role: (Array.isArray(googleUser.role) ? googleUser.role : [googleUser.role]) as User['role'],
        active: true,
        permissions: [], // Google OAuth users có thể cần permissions mặc định
      };

      return user;
    }
    
    return null;
  } catch (error: unknown) {
    console.error("Google OAuth callback error:", apiUtils.getErrorMessage(error));
    return null;
  }
}

/**
 * Xử lý Google OAuth callback từ response data có sẵn
 * Sử dụng khi backend đã xử lý và trả về data
 */
export function handleGoogleCallbackFromData(responseData: GoogleOAuthResponse): User | null {
  try {
    if (responseData?.user) {
      // Save accessToken to localStorage
      if (responseData.accessToken) {
        localStorage.setItem('authToken', responseData.accessToken);
        console.log('[Google OAuth] Access token saved to localStorage from data');
      }

      // Save refreshToken to localStorage (optional, for future use)
      if (responseData.refreshToken) {
        localStorage.setItem('refreshToken', responseData.refreshToken);
        console.log('[Google OAuth] Refresh token saved to localStorage from data');
      }

      const googleUser = responseData.user;
      const user: User = {
        id: googleUser.id,
        name: googleUser.fullName,
        email: googleUser.email,
        role: (Array.isArray(googleUser.role) ? googleUser.role : [googleUser.role]) as User['role'],
        active: true,
        permissions: [], 
      };
      return user;
    }
    
    return null;
  } catch (error: unknown) {
    console.error("Google OAuth callback data error:", error);
    return null;
  }
}

/**
 * Kiểm tra xem có đang trong Google OAuth callback không
 */
export function isGoogleCallback(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('code') && urlParams.has('state');
}

/**
 * Làm sạch URL sau khi xử lý Google OAuth callback
 */
export function cleanGoogleCallbackUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  window.history.replaceState({}, '', url.toString());
}
