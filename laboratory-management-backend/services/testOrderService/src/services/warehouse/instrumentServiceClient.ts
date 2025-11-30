import HttpClient from "../../utils/httpClient.util.js";

export interface Instrument {
  _id: string;
  instrument_code: string;
  instrument_name: string;
  instrument_type: string;
  manufacturer?: string;
  status: "Ready" | "Processing" | "Inactive";
  is_active: boolean;
  location?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
}

interface InstrumentListResponse {
  message: string;
  data: Instrument[];
  total: number;
  page: number;
  limit: number;
}

class InstrumentServiceClient {
  private baseUrl: string;
  private internalApiKey: string;

  constructor() {
    this.baseUrl = process.env.WAREHOUSE_API_BASE || "http://localhost:5003";
    this.internalApiKey = process.env.INTERNAL_API_KEY || "internal-service-secret-key-2025";
  }

  // Fetch a single user by id
  async getInstrumentById(instrumentId: string): Promise<Instrument | null> {
    try {
      const url = `${this.baseUrl}/api/warehouse/instruments/${instrumentId}`;
      const headers = { "X-Internal-API-Key": this.internalApiKey };
      const res = await HttpClient.get<{ message: string; data: Instrument }>(url, { headers });
      console.log("test api của instrument ");
      console.log("res", res.data);
      return res.data;
     
    } catch (err: any) {
      console.error(`[Warehouse Service] Error fetching instrument ${instrumentId}:`, err.message);
      return null;
    }
  }

  async getNextReadyInstrument(): Promise<Instrument | null> {
    try {
      const params = new URLSearchParams({
        status: "Ready",
        is_active: "true",
        limit: "1",
        page: "1",
        sort: "created_at",
      });
      const url = `${this.baseUrl}/api/warehouse/instruments?${params.toString()}`;
      const headers = { "X-Internal-API-Key": this.internalApiKey };
      const res = await HttpClient.get<InstrumentListResponse>(url, { headers });
      return Array.isArray(res.data) && res.data.length > 0 ? (res.data[0] ?? null) : null;
    } catch (err: any) {
      console.error("[Warehouse Service] Error fetching ready instrument:", err.message);
      return null;
    }
  }

  async updateInstrumentStatus(
    instrumentId: string,
    status: Instrument["status"],
    updatedBy?: string
  ): Promise<Instrument | null> {
    try {
      const url = `${this.baseUrl}/api/warehouse/instruments/${instrumentId}`;
      const headers = {
        "Content-Type": "application/json",
        "X-Internal-API-Key": this.internalApiKey,
      };
      const payload: Partial<Instrument> = {
        status,
        ...(updatedBy ? { updated_by: updatedBy } : {}),
      };
      const res = await HttpClient.put<{ message: string; data: Instrument }>(url, payload, { headers });
      return res.data;
    } catch (err: any) {
      console.error(`[Warehouse Service] Error updating instrument ${instrumentId} status:`, err.message);
      throw err;
    }
  }

  // Fetch multiple instrument and return a map id->instrumentId
  async getInstrumentsByIds(instrumentIds: string[]): Promise<Map<string, Instrument>> {
    const map = new Map<string, Instrument>();
    if (!Array.isArray(instrumentIds) || instrumentIds.length === 0) return map;
    const promises = instrumentIds.map((id) => this.getInstrumentById(id));
    const results = await Promise.all(promises);
    results.forEach((i) => {
      if (i) map.set(i._id, i);
    });
    return map;
  }
}

export default new InstrumentServiceClient();
