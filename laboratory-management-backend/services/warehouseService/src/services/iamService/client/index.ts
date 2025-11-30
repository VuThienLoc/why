import axios from "axios";

export interface IamUser {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
}

class IamServiceClient {
  private baseUrl: string;
  private internalKey: string;

  constructor() {
    this.baseUrl = process.env.IAM_SERVICE_URL ?? "http://localhost:3000";
    this.internalKey = process.env.INTERNAL_API_KEY ?? "internal-service-secret-key-2025";
  }

  async getUserById(userId: string): Promise<IamUser | null> {
    try {
      const response = await axios.get<{ user: IamUser }>(`${this.baseUrl}/api/internal/${userId}`, {
        headers: { "X-Internal-API-Key": this.internalKey },
      });
      return response.data.user;
    } catch (error) {
      console.warn(`[IamServiceClient] Failed to fetch user ${userId}`, error);
      return null;
    }
  }
}

export default new IamServiceClient();
