import HttpClient from "../../utils/httpClient.util.js";

export interface IamUser {
  _id: string;
  email: string;
  fullName: string;
  identityNumber: string;
  phoneNumber: string;
  gender: string;
  age: number;
  dateOfBirth: string;
  address: string;
  role: string;
  isActive: boolean;
  avatar?: string;
}

class IamServiceClient {
  private baseUrl: string;
  private internalApiKey: string;

  constructor() {
    this.baseUrl = process.env.IAM_SERVICE_URL || "http://localhost:3000";
    this.internalApiKey = process.env.INTERNAL_API_KEY || "internal-service-secret-key-2025";
  }

  // Fetch a single user by id
  async getUserById(userId: string): Promise<IamUser | null> {
    try {
      const url = `${this.baseUrl}/api/internal/${userId}`;
      const headers = { "X-Internal-API-Key": this.internalApiKey };
      const res = await HttpClient.get<{ user: IamUser }>(url, { headers });
      console.log("lấy user")
      console.log("res",res.user);
      return res.user;
     
    } catch (err: any) {
      console.error(`[IAM Service] Error fetching user ${userId}:`, err.message);
      return null;
    }
  }

  // Fetch multiple users and return a map id->user
  async getUsersByIds(userIds: string[]): Promise<Map<string, IamUser>> {
    const map = new Map<string, IamUser>();
    if (!Array.isArray(userIds) || userIds.length === 0) return map;
    const promises = userIds.map((id) => this.getUserById(id));
    const results = await Promise.all(promises);
    results.forEach((u) => {
      if (u) map.set(u._id, u);
    });
    return map;
  }
}

export default new IamServiceClient();
