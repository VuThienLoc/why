
import { apiService, apiUtils } from "../apiClient";
import type { User } from "../../types/User";


interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  role: ('ADMIN' | 'MANAGER' | 'SERVICE' | 'LAB_USER' | 'USER')[];
  isActive?: boolean;
  permissions?: string[];
  phoneNumber?: string;
  identifyNumber?: string;
  gender?: string;
  age?: number;
  address?: string;
  dateOfBirth?: string;
}

export async function authenticateUser(identifier: string, password: string): Promise<User | null> {
  try {
    const response = await apiService.post<{ user: BackendUser }>("/login", { identifier, password });
    if (response?.user) {
      const backendUser = response.user;

      const user: User = {
        id: backendUser.id,
        name: backendUser.fullName,
        email: backendUser.email,
        role: Array.isArray(backendUser.role)
          ? backendUser.role
          : [backendUser.role || "USER"],
        active: backendUser.isActive ?? true,
        permissions: backendUser.permissions || [],
        phone_number: backendUser.phoneNumber || "",
        identify_number: backendUser.identifyNumber || "",
        gender: backendUser.gender || "",
        age: backendUser.age ?? 0,
        address: backendUser.address || "",
        date_of_birth: backendUser.dateOfBirth || "",
      };

      return user;
    }

    return null;
  } catch (error: unknown) {
    console.error("Login error:", apiUtils.getErrorMessage(error));
    return null;
  }
}