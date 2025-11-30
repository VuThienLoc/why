import { apiService, apiUtils } from "../apiClient";
import type { RegisterRequest, RegisterResponse } from "../../pages/register/types/register";
import type { User } from "../../types/User";
export async function registerUser(userData: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await apiService.post<{ message: string; user: User }>("/register", userData);
    console.log("Register response:", response);
    if (response) {
      return {
        success: true,
        message: response.message || 'Đăng ký thành công',
      };
    }

    return {
      success: false,
      message: 'Đăng ký thất bại !',
    };
  } catch (error: unknown) {
    console.error("Register error:", apiUtils.getErrorMessage(error));
    
    const errorMessage = apiUtils.getErrorMessage(error) || 'Có lỗi xảy ra khi đăng ký';
    return {
      success: false,
      message: errorMessage,
    };
  }
}
