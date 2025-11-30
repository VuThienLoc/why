import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";
import HttpClient from "../utils/httpClient.util.js";

// Load patient service .env before reading process.env values
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../.env") });

// IAM Service User Interface
export interface IamUser {
  _id: string;
  email: string;
  fullName: string;
  identityNumber: string;
  gender: string;
  age: number;
  dateOfBirth: string;
  isActive: boolean;
  role: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
}

export class IamServiceClient {
  private baseUrl: string;
  private internalApiKey: string;

  constructor() {
    // IAM Service URL from environment or default
    this.baseUrl = process.env.IAM_SERVICE_URL || "http://localhost:3000";
    this.internalApiKey = process.env.INTERNAL_API_KEY || "internal-service-secret-key";
    
    console.log('[IamServiceClient] Initialized:');
    console.log('[IamServiceClient] baseUrl:', this.baseUrl);
    console.log('[IamServiceClient] internalApiKey:', this.internalApiKey ? '***' + this.internalApiKey.slice(-4) : 'NOT SET');
  }

  /**
   * Get user by ID from IAM Service
   */
  async getUserById(userId: string): Promise<IamUser | null> {
    try {
      const url = `${this.baseUrl}/api/internal/${userId}`;

      const headers = {
        'X-Internal-API-Key': this.internalApiKey, // Internal service authentication
      };

      const response = await HttpClient.get<{ user: IamUser }>(url, headers);
      return response.user;
    } catch (error: any) {
      console.error(`[IAM Service] Error fetching user ${userId}:`, error.message);
      return null; // Return null if user not found or service unavailable
    }
  }

  async searchUsersByFullName(keyword: string, limit: number = 20): Promise<IamUser[]> {
    const trimmed = keyword.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const url = `${this.baseUrl}/api/internal/users/search?q=${encodeURIComponent(trimmed)}&limit=${limit}`;
      const headers = {
        'X-Internal-API-Key': this.internalApiKey,
      };

      const response = await HttpClient.get<{ users: IamUser[] }>(url, headers);
      if (response && Array.isArray(response.users)) {
        return response.users;
      }
      return [];
    } catch (error: any) {
      console.error('[IAM Service] Error searching users by full name:', error.message);
      return [];
    }
  }

  /**
   * Get multiple users by IDs (batch request)
   */
  async getUsersByIds(userIds: string[]): Promise<Map<string, IamUser>> {
    const userMap = new Map<string, IamUser>();

    if (userIds.length === 0) return userMap;

    try {
      // Use Promise.all to fetch users in parallel
      const userPromises = userIds.map((id) => this.getUserById(id));
      const users = await Promise.all(userPromises);

      users.forEach((user, index) => {
        const userId = userIds[index];
        if (user && userId) {
          userMap.set(userId, user);
        }
      });

      return userMap;
    } catch (error: any) {
      console.error('[IAM Service] Error fetching multiple users:', error.message);
      return userMap;
    }
  }

  /**
   * Validate if user exists and is active
   */
  async validateUser(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user !== null && user.isActive === true;
  }
}

export default new IamServiceClient();
