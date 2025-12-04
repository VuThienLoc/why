import HttpClient from "../../utils/httpClient.util.js";
import iamServiceClient, { IamUser } from "../iam/iamServiceClient.js";

export interface Patient {
  _id: string;
  user_id: string;
  patient_code: string;
  emergency_contact?: {
    name?: string;
    phone?: string;
  };
  last_visit_date?: string;
  last_test_type?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  user?: IamUser | null;
}

class PatientServiceClient {
  private baseUrl: string;
  private internalApiKey: string;

  constructor() {
    this.baseUrl = process.env.PATIENT_SERVICE_URL || "http://localhost:5001";
    // Use the same default internal key as IAM service so local dev works without .env
    this.internalApiKey = process.env.INTERNAL_API_KEY || "internal-service-secret-key-2025";
  }

  async getPatientById(patientId: string): Promise<Patient | null> {
    try {
      const url = `${this.baseUrl}/api/patients/viewDetail/${patientId}`;
      const headers = { "X-Internal-API-Key": this.internalApiKey };
      const res = await HttpClient.get<{ patient: Patient }>(url, { headers });
      const patient = res.patient;
      if (patient?.user_id) {
        patient.user = await iamServiceClient.getUserById(patient.user_id);
      }

      return patient;
    } catch (err: any) {
      console.error(`[PatientService] Error fetching patient ${patientId}:`, err.message);
      return null;
    }
  }

  async getPatientByUserId(user_id: string): Promise<Patient | null> {
    try {
      const url = `${this.baseUrl}/api/patients/patientByUserId/${user_id}`;
      const headers = { "X-Internal-API-Key": this.internalApiKey };
      const res = await HttpClient.get<{ patient: Patient }>(url, { headers });
      const patient = res.patient;
      if (patient?.user_id) {
        patient.user = await iamServiceClient.getUserById(patient.user_id);
      }
      return patient;
    } catch (err: any) {
      console.error(`[PatientService] Error fetching patient ${user_id}:`, err.message);
      return null;
    }
  }

  async getPatientsByIds(patientIds: string[]): Promise<Map<string, Patient>> {
    const map = new Map<string, Patient>();
    if (!Array.isArray(patientIds) || patientIds.length === 0) return map;

    // Fetch in parallel (sequential fallback would be slower)
    const promises = patientIds.map((id) => this.getPatientById(id));
    const results = await Promise.all(promises);
    results.forEach((p) => {
      if (p) map.set(p._id, p);
    });
    return map;
  }
}

export default new PatientServiceClient();
