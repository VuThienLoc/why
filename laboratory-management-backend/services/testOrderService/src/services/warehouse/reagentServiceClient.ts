import HttpClient from "../../utils/httpClient.util.js";

export interface Reagent {
  _id: string;
  reagent_code: string;
  reagent_name: string;
  reagent_type: string;
  quantity_current: number;
  unit_of_measure: string;
  usage_per_run: number;
  expiration_date: Date;
  received_date: Date;
  status: "Available" | "LowStock" | "Expired" | "Depleted";
  low_stock_threshold?: number;
  storage_location?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
}

class ReagentServiceClient {
  private baseUrl: string;
  private internalApiKey: string;

  constructor() {
    this.baseUrl = process.env.WAREHOUSE_API_BASE || "http://localhost:5003";
    this.internalApiKey = process.env.INTERNAL_API_KEY || "internal-service-secret-key-2025";
  }

  // Fetch a single reagent by ID
  async getReagentById(reagentId: string): Promise<Reagent | null> {
    try {
      const url = `${this.baseUrl}/api/warehouse/reagents/${reagentId}`;
      const headers = { "X-Internal-API-Key": this.internalApiKey };
      const res = await HttpClient.get<{ success: boolean; data: Reagent }>(url, { headers });
      console.log("thông tin có lấy được reagent client ko nè")
      console.log(res.data);
      return res.data;

    } catch (err: any) {
      console.error(`[ReagentService] Error fetching reagent ${reagentId}:`, err.message);
      return null;
    }
  }

  // Fetch multiple reagents by IDs → return Map<id, reagent>
  async getReagentsByIds(reagentIds: string[]): Promise<Map<string, Reagent>> {
    const map = new Map<string, Reagent>();
    if (!Array.isArray(reagentIds) || reagentIds.length === 0) return map;

    const promises = reagentIds.map((id) => this.getReagentById(id));
    const results = await Promise.all(promises);

    results.forEach((r) => {
      if (r) map.set(r._id, r);
    });

    return map;
  }

   // 🔹 Cập nhật reagent (ví dụ: quantity_current, status, ...)
  async updateReagent(
    reagentId: string,
    updateData: Partial<Reagent>,
    operatorInfo?: {
      userId?: string;
      email?: string;
      name?: string;
      avatar?: string;
    }
  ): Promise<Reagent | null> {
    try {
      const url = `${this.baseUrl}/api/warehouse/reagents/${reagentId}`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Internal-API-Key": this.internalApiKey,
      };
      if (operatorInfo) {
        if (operatorInfo.userId) headers["x-user-id"] = operatorInfo.userId;
        if (operatorInfo.email) headers["x-user-email"] = operatorInfo.email;
        if (operatorInfo.name) headers["x-user-name"] = operatorInfo.name;
        if (operatorInfo.avatar) headers["x-user-avatar"] = operatorInfo.avatar;
      }

      const res = await HttpClient.put<{ success: boolean; data: Reagent }>(
        url,
        updateData,
        { headers }
      );

      console.log(`[ReagentService] Updated reagent ${reagentId}:`, res.data);
      return res.data;
    } catch (err: any) {
      console.error(`[ReagentService] Error updating reagent ${reagentId}:`, err.message);
      return null;
    }
  }
}

export default new ReagentServiceClient();
