import axios, { isAxiosError } from 'axios';

// Patient service URL 
const PATIENT_SERVICE_URL = import.meta.env.VITE_API_PATIENT_SERVICE_URL || 'http://localhost:5001';

// Create axios instance for patient service
const patientClient = axios.create({
  baseURL: PATIENT_SERVICE_URL,
  timeout: 10000,
  withCredentials: true, // Enable cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't treat 401/404 as errors to reduce console noise
  validateStatus: (status) => status >= 200 && status < 500,
});

patientClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Suppress errors in response interceptor
patientClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 404) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);


// Backend response types
interface BackendPatient {
  _id: string;
  patient_code?: string;
  user_id: string;
  is_active: boolean;
  is_deleted: boolean;
  last_test_type?: string;
  emergency_contact?: {
    name?: string;
    phone?: string;
  };
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    avatar?: string;
    identityNumber?: string;
    age?: number;
  } | null;
}

interface GetAllPatientsResponse {
  patients: BackendPatient[];
  total: number;
  page: number;
  totalPages: number;
}

// Frontend types
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
  emergency_contact?: {
    name: string;
    phone: string;
  };
  last_test_type?: string;
  is_active?: boolean;
}


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

const transformToDetailResponse = (backendPatient: BackendPatient): PatientDetailResponse => {
  return {
    id: backendPatient._id,
    patient_code: backendPatient.patient_code || '',
    user: backendPatient.user ? {
      id: backendPatient.user._id,
      fullName: backendPatient.user.fullName,
      email: backendPatient.user.email,
      identityNumber: backendPatient.user.identityNumber,
      phoneNumber: backendPatient.user.phoneNumber,
      gender: backendPatient.user.gender,
      age: backendPatient.user.age,
      dateOfBirth: backendPatient.user.dateOfBirth,
      address: backendPatient.user.address,
    } : undefined,
    emergency_contact: backendPatient.emergency_contact,
    is_active: backendPatient.is_active,
    created_by: backendPatient.created_by,
    created_at: backendPatient.created_at,
    updated_at: backendPatient.updated_at,
  };
};

export class PatientService {
  // GET /patients/getAll/
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PatientsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      queryParams.append('populateUser', 'true');

      const queryString = queryParams.toString();
      const endpoint = `/api/patients/getAll/${queryString ? `?${queryString}` : ''}`;

      const response = await patientClient.get<GetAllPatientsResponse>(endpoint);

      // Check status
      if (response.status === 401 || response.status === 404) {
        return { patients: [], total: 0, page: 1, totalPages: 0 };
      }

      const data = response.data;
      return {
        patients: data.patients || [],
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { patients: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // GET /patients/viewDetail/{id} 
  async viewDetail(id: string): Promise<PatientDetailResponse | null> {
    try {
      if (!id) return null;

      const endpoint = `/api/patients/viewDetail/${id}?populateUser=true`;
      const response = await patientClient.get(endpoint);

      // Check status
      if (response.status === 401 || response.status === 404) {
        return null;
      }

      const data = response.data;
      // Normalize response: { patient: {...} } | { data: {...} } | direct object
      const patient = data?.patient || data?.data || data;

      if (!patient || patient.is_deleted) {
        return null;
      }

      return transformToDetailResponse(patient);
    } catch (error) {
      console.error('Error fetching patient detail:', error);
      return null;
    }
  }

  // PUT /patients/update/{id} 
  async update(id: string, payload: UpdatePatientPayload): Promise<PatientDetailResponse | null> {
    try {
      if (!id) return null;

      const endpoint = `/api/patients/update/${id}`;
      const response = await patientClient.put(endpoint, payload);

      // Check status
      if (response.status === 401 || response.status === 404) {
        return null;
      }

      const data = response.data;
      const patient = data?.patient || data?.data || data;

      if (!patient) {
        return null;
      }

      return transformToDetailResponse(patient);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error('Không thể cập nhật thông tin bệnh nhân');
    }
  }

  // DELETE /patients/delete/{id} 
  async delete(id: string): Promise<boolean> {
    try {
      if (!id) return false;

      const endpoint = `/api/patients/delete/${id}`;
      const response = await patientClient.delete(endpoint);

      // Success if 2xx
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Error deleting patient:', error);
      return false;
    }
  }

  // Get all patients for dropdown
  async getAllForDropdown(): Promise<PatientOption[]> {
    try {
      const response = await this.getAll({
        page: 1,
        limit: 1000,
        isActive: true,
      });

      return response.patients
        .filter((p) => !p.is_deleted && p.is_active && p.user)
        .map(transformBackendPatient);
    } catch (error) {
      console.error('Error fetching patients for dropdown:', error);
      return [];
    }
  }

  // Get patient by ID as PatientOption
  async getById(id: string): Promise<PatientOption | null> {
    try {
      const detail = await this.viewDetail(id);
      if (!detail) return null;

      return {
        id: detail.id,
        fullName: detail.user?.fullName || 'N/A',
        email: detail.user?.email,
        phoneNumber: detail.user?.phoneNumber,
        patientCode: detail.patient_code,
        dateOfBirth: detail.user?.dateOfBirth,
        gender: detail.user?.gender,
        address: detail.user?.address,
      };
    } catch (error) {
      console.error('Error fetching patient by ID:', error);
      return null;
    }
  }

  // Alias methods for backward compatibility
  async getAllPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PatientOption[]> {
    const response = await this.getAll(params);
    return response.patients
      .filter((p) => !p.is_deleted && p.is_active && p.user)
      .map(transformBackendPatient);
  }

  async getAllPatientsForDropdown(): Promise<PatientOption[]> {
    return this.getAllForDropdown();
  }

  async getPatientById(id: string): Promise<PatientOption | null> {
    return this.getById(id);
  }
}

// Export singleton instance
export const patientService = new PatientService();


export async function fetchPatients(page = 1, limit = 10): Promise<PatientsResponse> {
  return patientService.getAll({ page, limit });
}

export async function viewPatientDetail(id: string): Promise<PatientDetailResponse | null> {
  return patientService.viewDetail(id);
}

export async function deletePatient(id: string): Promise<boolean> {
  return patientService.delete(id);
}

export async function updatePatient(id: string, payload: Partial<UpdatePatientPayload>): Promise<PatientDetailResponse | null> {
  return patientService.update(id, payload as UpdatePatientPayload);
}

export default patientService;

