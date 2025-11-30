
import { apiService, apiUtils } from "../apiClient";

export async function logoutUser(): Promise<boolean> {
  try {
    const response = await apiService.post("/logout", {});

    // Nếu backend trả về 204 hoặc 200 → thành công
    if (response) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Logout failed:", apiUtils.getErrorMessage(error));
    return false;
  }
}
