// AuthProvider.tsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom"; // THÊM DÒNG NÀY
import { AuthContext } from "../context/AuthContext";
import type { AuthContextType } from "../types/AuthContextType";
import type { User, SafeUser } from "../types/User";
import { apiClient } from "../service/apiClient";
import { handleGoogleCallback, isGoogleCallback, cleanGoogleCallbackUrl } from "../service/authService/googleOAuthApi";

const rehydrateStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("limsUser");
    if (!stored) return null;

    const parsed: SafeUser = JSON.parse(stored);
    if (!parsed?.id) return null;

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email ?? "",
      role: Array.isArray(parsed.role) ? parsed.role : [],
      active: parsed.active ?? true,
      permissions: parsed.permissions ?? [],
    };
  } catch (error) {
    console.warn("Failed to rehydrate stored user:", error);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("limsUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Các route public không cần kiểm tra authentication
    const publicRoutes = ['/', '/login', '/register', '/auth/google/callback', '/forgot-password', '/forgot-password/success', '/reset-password'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (isPublicRoute) {
      // Nếu là route public, chỉ xử lý Google OAuth callback nếu cần
      if (location.pathname === '/auth/google/callback' || isGoogleCallback()) {
        const handleGoogleAuth = async () => {
          try {
            const googleUser = await handleGoogleCallback();
            if (googleUser) {
              onLogin(googleUser);
              cleanGoogleCallbackUrl();
            }
          } catch (error) {
            console.error('Google OAuth error:', error);
          } finally {
            setLoading(false);
          }
        };
        handleGoogleAuth();
        return;
      }
      
      // Các route public khác không cần kiểm tra auth
      setLoading(false);
      if (location.pathname === '/login') {
        hasInitialized.current = false; // Reset khi vào trang login
      }
      return;
    }

    // 2. Nếu đã initialize cho phiên hiện tại, không cần gọi API lại
    if (hasInitialized.current) {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      hasInitialized.current = true; // Đánh dấu đã bắt đầu initialize
      setLoading(true);

      if (!user) {
        const storedUser = rehydrateStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }

      // Google OAuth
      if (isGoogleCallback()) {
        try {
          const googleUser = await handleGoogleCallback();
          if (googleUser) {
            onLogin(googleUser);
            cleanGoogleCallbackUrl();
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Google OAuth error:', error);
        }
      }

      // KIỂM TRA TOKEN
      try {
        const res = await apiClient.get('/user/me/roles');
        const data = res.data;
        const authenticatedUser: User = {
          id: data.userId,
          name: data.fullName,
          email: data.email,
          role: data.roles.map((r: { roleCode: string }) => r.roleCode),
          active: true,
          permissions: data.aggregatedPrivileges || [],
        };

        onLogin(authenticatedUser);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          // Xử lý lỗi 401 (Unauthorized) - token không hợp lệ
          if (error.response?.status === 401) {
            localStorage.removeItem("limsUser");
            setUser(null);
          } 
          // Bỏ qua lỗi network khi backend chưa chạy (development)
          else if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
            // Chỉ log ở development mode
            if (import.meta.env.DEV) {
              console.warn('Backend không khả dụng. Vui lòng kiểm tra backend service đã chạy chưa.');
            }
            // Nếu có user trong localStorage, giữ lại để offline mode
            const storedUser = rehydrateStoredUser();
            if (storedUser) {
              setUser(storedUser);
            } else {
              setUser(null);
            }
          } 
          // Các lỗi khác
          else {
            console.error('Auth check failed:', error);
          }
        } else {
          console.error('Unknown error:', error);
        }
      } finally {
        setLoading(false);
      }

    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // CHỈ THEO DÕI location.pathname, KHÔNG BAO GỒM user

  const onLogin = (userData: User) => {
    setUser(userData);
    const safeUser: SafeUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: Array.isArray(userData.role) ? userData.role : [userData.role],
      active: userData.active ?? true,
      permissions: userData.permissions || [],
    };
    localStorage.setItem("limsUser", JSON.stringify(safeUser));
  };

  const onLogout = async () => {
    if (location.pathname === '/login') {
      setUser(null);
      localStorage.removeItem("limsUser");
      localStorage.removeItem("authToken"); // Remove token from localStorage
      hasInitialized.current = false; // Reset flag
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/logout').catch(() => { });
    } catch (error) {
      console.error('Logout error:', error);
    }

    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    localStorage.removeItem("limsUser");
    localStorage.removeItem("authToken"); // Remove token from localStorage
    setUser(null);
    hasInitialized.current = false; // Reset flag để có thể initialize lại khi login
    window.location.href = '/login';
  };

  const value: AuthContextType = { user, onLogin, onLogout, loading };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex justify-center items-center h-screen text-xl">
          Đang tải...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
