import axios, { isAxiosError } from 'axios';

const PATIENT_SERVICE_URL =
  import.meta.env.VITE_API_PATIENT_SERVICE_URL || 'http://localhost:5001';

// Create axios instance
const pmrClient = axios.create({
  baseURL: PATIENT_SERVICE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: (status) => status >= 200 && status < 500,
});

const getTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return value;
    }
  }
  return null;
};

// Attach Authorization header
pmrClient.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export interface PMRPatientEmbed {
  _id?: string;
  user_id?: string;
  patient_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientMedicalRecord {
  _id: string;
  patient_id: string;
  record_code: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  medical_history?: string;
  clinical_notes?: string;
  recent_test_summary?: string;
  created_by?: string;
  updated_by?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  patient?: PMRPatientEmbed & {
    user?: {
      email?: string;
      fullName?: string;
      identityNumber?: string;
      phoneNumber?: string;
      gender?: string;
      dateOfBirth?: string;
      address?: string;
      age?: number;
    };
  };
}

export interface PMRListResponse {
  records: PatientMedicalRecord[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}


function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 404) return 'Không tìm thấy hồ sơ y tế.';
    if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';

    const data = error.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  }

  if (error instanceof Error) return error.message;
  return 'Không thể thực hiện thao tác. Vui lòng thử lại.';
}


export class PatientMedicalRecordService {
  // GET /patient-medical-records/getAll/ 
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
  }): Promise<PMRListResponse> {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;

      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.patientId) queryParams.append('patientId', params.patientId);

      const endpoint = `/api/patient-medical-records/getAll/?${queryParams.toString()}`;
      const response = await pmrClient.get(endpoint);

      // Check status
      if (response.status === 401 || response.status === 404) {
        return { records: [], total: 0, page, limit, totalPages: 0 };
      }

      const data = response.data;
      // Normalize response
      const records = data?.records || data?.data || data?.items || [];
      return {
        records: Array.isArray(records) ? records : [],
        total: data?.total ?? data?.totalCount ?? 0,
        page: data?.page ?? page,
        limit: data?.limit ?? limit,
        totalPages: data?.totalPages ?? data?.total_pages ?? 0,
      };
    } catch (error) {
      console.error('Error fetching patient medical records:', error);
      return { records: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  }

  // GET /patient-medical-records/viewDetail/{id} 
  async viewDetail(id: string): Promise<PatientMedicalRecord | null> {
    try {
      if (!id) return null;

      const endpoint = `/api/patient-medical-records/viewDetail/${id}`;
      const response = await pmrClient.get(endpoint);

      // Check status
      if (response.status === 401 || response.status === 404) {
        return null;
      }

      const data = response.data;
      // Normalize: { record: {...} } | { data: {...} } | direct object
      const record = data?.record || data?.data || data;

      if (!record || record.is_deleted) {
        return null;
      }

      return record;
    } catch (error) {
      console.error('Error fetching patient medical record detail:', error);
      return null;
    }
  }

  // POST /patient-medical-records/create/ 
  async create(payload: {
    patient_id: string;
    blood_type?: string;
    allergies?: string;
    chronic_conditions?: string;
    current_medications?: string;
    medical_history?: string;
    clinical_notes?: string;
    recent_test_summary?: string;
  }): Promise<PatientMedicalRecord> {
    const endpoint = `/api/patient-medical-records/create/`;
    const response = await pmrClient.post(endpoint, payload);

    // Check status
    if (response.status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    if (response.status >= 400) {
      const errorMsg = response.data?.message || response.data?.error || 'Không thể tạo hồ sơ y tế';
      throw new Error(errorMsg);
    }

    const data = response.data;
    const record = data?.record || data?.data || data;

    if (!record || !record._id) {
      throw new Error('Không thể tạo hồ sơ y tế. Vui lòng thử lại.');
    }

    return record;
  }

  // PUT /patient-medical-records/update/{id} 
  async update(
    id: string,
    payload: {
      blood_type?: string;
      allergies?: string;
      chronic_conditions?: string;
      current_medications?: string;
      medical_history?: string;
      clinical_notes?: string;
      recent_test_summary?: string;
    }
  ): Promise<PatientMedicalRecord | null> {
    try {
      if (!id) return null;

      const endpoint = `/api/patient-medical-records/update/${id}`;
      const response = await pmrClient.put(endpoint, payload);

      // Check status
      if (response.status === 401 || response.status === 404) {
        return null;
      }

      const data = response.data;
      const record = data?.record || data?.data || data;

      return record || null;
    } catch (error) {
      console.error('Error updating patient medical record:', error);
      throw new Error(extractErrorMessage(error));
    }
  }

  // DELETE /patient-medical-records/delete/{id} 
  async delete(id: string): Promise<boolean> {
    try {
      if (!id) return false;

      const endpoint = `/api/patient-medical-records/delete/${id}`;
      const response = await pmrClient.delete(endpoint);

      // Success if 2xx
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Error deleting patient medical record:', error);
      return false;
    }
  }

  // Alias for backward compatibility
  async getDetail(id: string): Promise<PatientMedicalRecord | null> {
    return this.viewDetail(id);
  }

  async remove(id: string): Promise<boolean> {
    return this.delete(id);
  }
}

// Export singleton instance
export const patientMedicalRecordService = new PatientMedicalRecordService();

export default patientMedicalRecordService;


