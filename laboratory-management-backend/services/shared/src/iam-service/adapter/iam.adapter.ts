import axios from "axios";
import type { IIamClient } from ".././port/iam.port.js";
import type { AuthenticatedUser } from "../../types/authenticatedUser.type.js";

class IamServiceClient implements IIamClient {
  private baseUrl: string;
  private internalKey: string;

  constructor() {
    this.baseUrl = process.env.IAM_BASE_URL || "http://localhost:3000";
    this.internalKey = process.env.INTERNAL_API_KEY || "internal-service-secret-key-2025";
  }

  async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    try {
      const res = await axios.get<{ user: AuthenticatedUser }>(
        `${this.baseUrl}/api/internal/${userId}`,
        {
          headers: { "X-Internal-API-Key": this.internalKey },
        }
      );
      return res.data.user;
    } catch (err) {
      console.error("[IamServiceClient] getUserById failed");
      return null;
    }
  }

  async validateUser(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.isActive ?? false;
  }
}

export default new IamServiceClient();