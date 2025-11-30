import { apiService, apiUtils } from "../apiClient";
import type { User } from "../../types/User";

export interface GoogleOAuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
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
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  // Kiểm tra xem baseUrl đã có /api chưa để tránh duplicate
  const googleLoginUrl = baseUrl.endsWith('/api') 
    ? `${baseUrl}/google?returnTo=${encodeURIComponent(returnTo)}`
    : `${baseUrl}/api/google?returnTo=${encodeURIComponent(returnTo)}`;
  
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
      // Mapping dữ liệu từ Google OAuth response sang User type
      const googleUser = response.user;
      
      const user: User = {
        id: googleUser.id,
        name: googleUser.fullName,
        email: googleUser.email,
        role: Array.isArray(googleUser.role) ? googleUser.role.flat() : [googleUser.role],
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
      const googleUser = responseData.user;
      const user: User = {
        id: googleUser.id,
        name: googleUser.fullName,
        email: googleUser.email,
        role: Array.isArray(googleUser.role) ? googleUser.role.flat() : [googleUser.role],
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
