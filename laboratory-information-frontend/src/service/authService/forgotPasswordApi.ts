import { apiClient, apiUtils } from "../apiClient";

/**
 * Request password reset email
 * @param email - User's email address
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await apiClient.post("/reset-password/request", { email });
  } catch (error) {
    const message = apiUtils.getErrorMessage(error);
    throw new Error(message);
  }
};

/**
 * Confirm password reset with token
 * @param dedicatedToken - Token from email link
 * @param password - New password
 */
export const confirmPasswordReset = async (
  dedicatedToken: string,
  password: string
): Promise<void> => {
  try {
    await apiClient.post("/reset-password/confirm", {
      dedicatedToken,
      password,
    });
  } catch (error) {
    const message = apiUtils.getErrorMessage(error);
    throw new Error(message);
  }
};
