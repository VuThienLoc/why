import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { apiUtils, apiService, apiClient } from './apiClient';

// Create a dedicated axios instance for Patient service
// Patient service runs on port 5001 independently
const PATIENT_SERVICE_URL = import.meta.env.VITE_PATIENT_SERVICE_URL || 'http://localhost:5001';
const patientApiClient: AxiosInstance = axios.create({
  baseURL: PATIENT_SERVICE_URL,
  timeout: 10000,
  withCredentials: true, // Enable cookies for JWT authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header like the global apiClient
patientApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers = config.headers || {};
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const PATIENT_API_BASE_URL = '/api/patients';
// Patient API client for backend patient service (legacy support for develop branch)
const PATIENT_API_BASE = 'http://localhost:5001/api';

// Backend API response types
interface BackendPatient {
  _id: string;
  patient_code?: string;
  user_id: string;
  is_active: boolean;
  is_deleted: boolean;
  last_test_type?: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    avatar?: string;
  } | null;
}

interface GetAllPatientsResponse {
  patients: BackendPatient[];
  total: number;
  page: number;
  totalPages: number;
}

// Frontend Patient interface for dropdown
export interface PatientOption {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  patientCode?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatar?: string;
}

// Legacy interfaces from develop branch
export interface PatientDetailResponse {
  id: string;
  patient_code: string;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    identityNumber?: string;
    phoneNumber?: string;
    gender?: string;
    age?: number;
    dateOfBirth?: string;
    address?: string;
  };
  emergency_contact?: {
    name?: string;
    phone?: string;
  };
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientsResponse {
  patients: BackendPatient[];
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface UpdatePatientPayload {
  id: string;
  emergency_contact: {
    name: string;
    phone: string;
  };
  last_test_type?: string;
  is_active?: boolean;
  avatar?: string;
}

// Transform backend response to frontend format
const transformBackendPatient = (backendPatient: BackendPatient): PatientOption => {
  return {
    id: backendPatient._id,
    fullName: backendPatient.user?.fullName || 'N/A',
    email: backendPatient.user?.email,
    phoneNumber: backendPatient.user?.phoneNumber,
    patientCode: backendPatient.patient_code,
    dateOfBirth: backendPatient.user?.dateOfBirth,
    gender: backendPatient.user?.gender,
    address: backendPatient.user?.address,
    avatar: backendPatient.user?.avatar,
  };
};

// Patient Service API (for LabUser dropdown and other features)
export const patientService = {
  // Get all patients with pagination and filters
  async getAllPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    populateUser?: boolean;
  }): Promise<PatientOption[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.populateUser !== undefined) queryParams.append('populateUser', params.populateUser.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `${PATIENT_API_BASE_URL}/getAll/?${queryString}`
        : `${PATIENT_API_BASE_URL}/getAll/`;

      // Try using patientApiClient first, fallback to apiService if needed
      let responseData: GetAllPatientsResponse;
      try {
        const response = await patientApiClient.get<GetAllPatientsResponse>(endpoint);
        responseData = response.data;
      } catch {
        // If dedicated service fails, try using main API client
        console.warn('Patient service dedicated client failed, trying main API client');
        responseData = await apiService.get<GetAllPatientsResponse>(endpoint);
      }

      // Filter out deleted patients and return active ones with user info
      return responseData.patients
        .filter((p: BackendPatient) => !p.is_deleted && p.is_active && p.user) // Only active patients with user info
        .map(transformBackendPatient);
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  // Get all patients without pagination (for dropdowns)
  async getAllPatientsForDropdown(): Promise<PatientOption[]> {
    try {
      // Fetch with a large limit to get all active patients
      return await this.getAllPatients({
        page: 1,
        limit: 1000, // Large limit to get all patients
        isActive: true,
        populateUser: true,
      });
    } catch (error) {
      console.error('Error fetching patients for dropdown:', error);
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },

  // Get patient by ID
  async getPatientById(id: string): Promise<PatientOption | null> {
    try {
      const endpoints = [
        `${PATIENT_API_BASE_URL}/viewDetail/${id}?populateUser=true`,
        `/patients/viewDetail/${id}`,
      ];

      // Try multiple endpoints and clients
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let raw: any | null = null;
      for (const ep of endpoints) {
        try {
          const res = await patientApiClient.get(ep);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          raw = (res as any).data ?? res;
          break;
        } catch {
          try {
            raw = await apiService.get(ep);
            break;
          } catch {
            // try next
          }
        }
      }

      if (!raw) return null;

      // Normalize possible shapes: { patient: {...} } | direct object | { data: {...} }
      const obj = raw as Record<string, unknown>;
      const backendPatient = (obj.patient || obj.data || obj) as BackendPatient;

      if (!backendPatient || (backendPatient as unknown as { is_deleted?: boolean }).is_deleted) {
        return null;
      }

      return transformBackendPatient(backendPatient);
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw new Error(apiUtils.getErrorMessage(error));
    }
  },
};

// Legacy functions for admin pages (from develop branch)
export async function fetchPatients(page = 1, limit = 10): Promise<PatientsResponse> {
  try {
    const url = `${PATIENT_API_BASE}/patients/getAll?page=${page}&limit=${limit}`;
    const res = await axios.get(url, { timeout: 5000 });
    // Expect backend to return { patients: [...], total, page, totalPages }
    const body = res.data ?? {};
    // normalize possible shapes
    if (Array.isArray(body)) {
      return { patients: body };
    }
    if (Array.isArray(body.patients)) {
      return {
        patients: body.patients as BackendPatient[],
        total: body.total ?? body.totalCount,
        page: body.page ?? page,
        totalPages: body.totalPages ?? body.total_pages ?? undefined,
      };
    }
    // Try other common shapes
    const data = body.data ?? body.patients ?? [];
    return {
      patients: Array.isArray(data) ? (data as BackendPatient[]) : [],
      total: body.total ?? undefined,
      page: body.page ?? undefined,
      totalPages: body.totalPages ?? undefined,
    };
  } catch (error) {
    // Provide more actionable logging for common failures
    // axios error typing is broad; attempt to extract response/status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e: any = error;
    if (e?.response) {
      console.error(`PatientService.fetchPatients error: HTTP ${e.response.status} - ${e.response.statusText}`, e.response.data ?? e.message);
      if (e.response.status === 404) {
        console.error(`Requested URL ${PATIENT_API_BASE}/patients/getAll returned 404. Verify the patient service is running and that the endpoint path is correct (should be ${PATIENT_API_BASE}/patients/getAll).`);
      }
    } else {
      console.error('PatientService.fetchPatients error:', e?.message ?? e);
    }
    return { patients: [] };
  }
}

export async function viewPatientDetail(id: string): Promise<PatientDetailResponse | null> {
  try {
    const url = `${PATIENT_API_BASE}/patients/viewDetail/${id}`;
    const res = await axios.get(url, { timeout: 5000 });
    // Normalize possible shapes: { data: {...} } or { patient: {...} } or direct object
    const raw = res.data;
    let candidate = raw?.data ?? raw?.patient ?? raw?.result ?? raw;

    // If candidate is an object with nested `data` (some APIs wrap twice)
    if (candidate && (candidate.data || candidate.patient)) {
      candidate = candidate.data ?? candidate.patient ?? candidate;
    }

    // If still nullish, log and return null
    if (!candidate) {
      console.warn('viewPatientDetail: empty response for id', id, 'full response:', raw);
      return null;
    }

    return candidate as PatientDetailResponse;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e: any = error;
    if (e?.response) {
      console.error(`PatientService.viewPatientDetail error: HTTP ${e.response.status} - ${e.response.statusText}`, e.response.data ?? e.message);
    } else {
      console.error('PatientService.viewPatientDetail error:', e?.message ?? e);
    }
    return null;
  }
}

export async function deletePatient(id: string): Promise<boolean> {
  try {
    // Backend delete endpoint (per spec): /patients/delete/{id}
    const url = `${PATIENT_API_BASE}/patients/delete/${id}`;
    // Use apiClient so cookies/auth are correctly attached
    const res = await apiClient.delete(url, { timeout: 5000 });
    // consider success if 2xx
    return res.status >= 200 && res.status < 300;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e: any = error;
    if (e?.response) {
      console.error(`PatientService.deletePatient error: HTTP ${e.response.status} - ${e.response.statusText}`, e.response.data ?? e.message);
    } else {
      console.error('PatientService.deletePatient error:', e?.message ?? e);
    }
    return false;
  }
}

export async function updatePatient(id: string, payload: Partial<UpdatePatientPayload>): Promise<PatientDetailResponse | null> {
  try {
    const url = `${PATIENT_API_BASE}/patients/update/${id}`;
    
    // Ensure id is included in payload as required by API
    const fullPayload: UpdatePatientPayload = {
      id,
      emergency_contact: {
        name: payload.emergency_contact?.name || '',
        phone: payload.emergency_contact?.phone || ''
      },
      is_active: true
    };

    console.log('Sending update request:', { url, payload: fullPayload });
    
    // Use apiClient which already handles auth headers
    const res = await apiClient.put(url, fullPayload);

    // normalize response
    const body = res.data ?? res;
    console.log('Update response:', body);
    
    const candidate = body?.data ?? body?.patient ?? body;
    if (!candidate) {
      console.warn('Update response missing data:', body);
    }
    return candidate ?? null;
  } catch (error) {
    console.error('PatientService.updatePatient error:', error);
    // Re-throw to let component handle the error
    throw error;
  }
}

export default { fetchPatients, viewPatientDetail, deletePatient, updatePatient };
