import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";
import HttpClient from "../utils/httpClient.util.js";
import type { MonitoringServiceNameType } from "../constants/monitoring.constant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../.env") });

export interface MonitoringEventLogPayload {
  event_code: string;
  action: string;
  event_message: string;
  service_name: MonitoringServiceNameType | string;
  entity_id?: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  operator_id: string;
  operator_name?: string | undefined;
  operator_gmail?: string | undefined;
  operator_role?: string | undefined;
  operator_avatar?: string | undefined;
  occurred_at?: Date;
  error_message?: string;
}

class MonitoringServiceClient {
  private baseUrl: string;
  private internalApiKey: string;

  constructor() {
    this.baseUrl = process.env.MONITORING_SERVICE_URL || "http://localhost:5004";
    this.internalApiKey = process.env.INTERNAL_API_KEY || "internal-service-secret-key";
  }

  async createEventLog(payload: MonitoringEventLogPayload): Promise<void> {
    const url = `${this.baseUrl}/api/event-logs/`;
    const headers = {
      "X-Internal-API-Key": this.internalApiKey,
    };

    await HttpClient.post(url, payload, headers);
  }
}

export default new MonitoringServiceClient();
