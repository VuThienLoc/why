import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";
import HttpClient from "../utils/httpClient.util.js";

// Load monitoring service .env
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
  phoneNumber?: string | null;
  address?: string | null;
}

export class IamServiceClient {
  private baseUrl: string;
  private internalApiKey: string;

  constructor() {
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
        'X-Internal-API-Key': this.internalApiKey,
      };

      const response = await HttpClient.get<{ user: IamUser }>(url, headers);
      return response.user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`[IAM Service] Error fetching user ${userId}:`, error.message);
      }
      return null;
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
