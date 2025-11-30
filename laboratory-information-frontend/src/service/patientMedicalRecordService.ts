import axios, { type AxiosInstance, isAxiosError } from 'axios';
import { apiService } from './apiClient';

const PATIENT_SERVICE_URL = import.meta.env.VITE_PATIENT_SERVICE_URL || 'http://localhost:5001';

const pmrApiClient: AxiosInstance = axios.create({
  baseURL: PATIENT_SERVICE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

pmrApiClient.interceptors.request.use((config) => {
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
});

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

const ENDPOINTS = {
  list: ['/api/patient-medical-records/getAll', '/patient-medical-records/getAll'],
  detail: (id: string) => [`/api/patient-medical-records/viewDetail/${id}`, `/patient-medical-records/viewDetail/${id}`],
};

async function tryGet<T>(path: string): Promise<T> {
  // Helper: strip '/api' prefix for alt paths
  const stripApi = (p: string) => (p.startsWith('/api/') ? p.replace('/api/', '/') : p);
  const altPath = stripApi(path);

  // Try authenticated to 5001
  try {
    const res = await pmrApiClient.get<T>(path);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res as any).data as T;
  } catch {
    // Try authenticated to 5001 with stripped '/api'
    try {
      const res2 = await pmrApiClient.get<T>(altPath);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (res2 as any).data as T;
  } catch {
      // Try anonymous (no Authorization header) to 5001
      try {
        const anon = axios.create({ baseURL: PATIENT_SERVICE_URL, withCredentials: true });
        const res3 = await anon.get<T>(path);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (res3 as any).data as T;
  } catch {
        try {
          const anon = axios.create({ baseURL: PATIENT_SERVICE_URL, withCredentials: true });
          const res4 = await anon.get<T>(altPath);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (res4 as any).data as T;
        } catch {
          // Final fallback to main API service (likely 3000)
          return await apiService.get<T>(path);
        }
      }
    }
  }
}

const DEFAULT_PMR_ERROR = 'Không thể tạo hồ sơ y tế. Vui lòng thử lại.';

function extractErrorMessage(error: unknown, fallback = DEFAULT_PMR_ERROR): string {
  const normalize = (value: unknown): string | undefined => {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return undefined;
  };

  if (isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | string | undefined;
    const topLevelMessage = normalize(data);
    if (topLevelMessage) return topLevelMessage;

    if (data && typeof data === 'object') {
      const nestedRaw = (data as { error?: unknown }).error ?? (data as { message?: unknown }).message;
      const nestedMessage = normalize(nestedRaw);
      if (nestedMessage) return nestedMessage;

      const detailsRaw = (data as { details?: { message?: unknown } }).details?.message;
      const detailsMessage = normalize(detailsRaw);
      if (detailsMessage) return detailsMessage;

      if ('errors' in data && Array.isArray((data as { errors?: unknown }).errors)) {
        const firstError = (data as { errors?: unknown[] }).errors?.[0];
        const firstMessage = normalize(firstError);
        if (firstMessage) return firstMessage;
      }
    }

    const status = error.response?.status;
    if (status === 404) return 'Bệnh nhân đã có hồ sơ y tế.';
    if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (status === 403) return 'Bạn không có quyền thực hiện thao tác này (403).';
    if (status) return `Yêu cầu thất bại (HTTP ${status}).`;

    if (normalize(error.message)) return error.message as string;
  }

  if (error instanceof Error && normalize(error.message)) return error.message;
  const fallbackMessage = normalize(error);
  if (fallbackMessage) return fallbackMessage;
  return fallback;
}

function isPMRListResponse(v: unknown): v is PMRListResponse {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  return Array.isArray(obj.records);
}

type AltPMRListResponse = {
  data?: PatientMedicalRecord[];
  items?: PatientMedicalRecord[];
  total?: number;
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  total_pages?: number;
};

function isAltPMRList(v: unknown): v is AltPMRListResponse {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  return Array.isArray(obj.data as unknown[]) || Array.isArray(obj.items as unknown[]);
}

export const patientMedicalRecordService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; sort?: string; testType?: string; instrument?: string; fromDate?: string; toDate?: string; patientId?: string; }): Promise<PMRListResponse> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
  const q: Record<string, string> = { page: String(page), limit: String(limit) };
    if (params?.search) q.search = params.search;
    if (params?.sort) q.sort = params.sort;
    if (params?.testType) q.testType = params.testType;
    if (params?.instrument) q.instrument = params.instrument;
    if (params?.fromDate) q.fromDate = params.fromDate;
    if (params?.toDate) q.toDate = params.toDate;
    if (params?.patientId) {
      q.patientId = params.patientId;
      // also send alternate param commonly used by backends
      q.patient_id = params.patientId;
    }
    const query = `?${new URLSearchParams(q).toString()}`;

    // Try a wide range of possible list endpoints
    const candidates = [
      ...ENDPOINTS.list,
      '/api/patient-medical-records',
      '/patient-medical-records',
      '/api/patient-medical-records/list',
      '/patient-medical-records/list',
      // possible custom endpoints by patient
      `/api/patient-medical-records/by-patient/${params?.patientId ?? ''}`,
      `/patient-medical-records/by-patient/${params?.patientId ?? ''}`,
    ];

    for (const base of candidates) {
      try {
        const data = await tryGet<unknown>(`${base}${query}`);
        if (isPMRListResponse(data)) return data;
        if (isAltPMRList(data)) {
          return {
            records: (data.data || data.items) ?? [],
            total: data.total ?? data.totalCount,
            page: data.page ?? page,
            limit: data.limit ?? limit,
            totalPages: data.totalPages ?? data.total_pages,
          };
        }
      } catch {
        // try next
      }
    }
    return { records: [], total: 0, page, limit, totalPages: 0 };
  },

  async getDetail(id: string): Promise<PatientMedicalRecord | null> {
    const candidates = [
      ...ENDPOINTS.detail(id),
      `/api/patient-medical-records/${id}`,
      `/patient-medical-records/${id}`,
      `/api/patient-medical-records/view-detail/${id}`,
      `/patient-medical-records/view-detail/${id}`,
      `/api/patient-medical-records/view/${id}`,
      `/patient-medical-records/view/${id}`,
    ];
    for (const path of candidates) {
      try {
        const data = await tryGet<unknown>(path);
        if (data && typeof data === 'object') {
          const obj = data as Record<string, unknown>;
          // Normalize: direct object, { record: {...} }, { data: {...} }
          const candidate = (obj.record && typeof obj.record === 'object')
            ? (obj.record as PatientMedicalRecord)
            : (obj.data && typeof obj.data === 'object')
              ? (obj.data as PatientMedicalRecord)
              : (data as PatientMedicalRecord);
          if (candidate && typeof candidate._id === 'string') return candidate;
        }
      } catch {
        // try next
      }
    }
    return null;
  },

  async create(payload: {
    patient_id: string;
    blood_type?: string;
    allergies?: string;
    chronic_conditions?: string;
    current_medications?: string;
    medical_history?: string;
    clinical_notes?: string;
    recent_test_summary?: string;
  }): Promise<PatientMedicalRecord | null> {
    const candidates = [
      '/api/patient-medical-records/create',
      '/patient-medical-records/create',
    ];
    let lastError: unknown = null;
    for (const path of candidates) {
      try {
        const res = await pmrApiClient.post(path, payload);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (res as any).data ?? res;
        if (data && typeof data === 'object') {
          const obj = data as Record<string, unknown>;
          const candidate = (obj.record && typeof obj.record === 'object')
            ? (obj.record as PatientMedicalRecord)
            : (obj.data && typeof obj.data === 'object')
              ? (obj.data as PatientMedicalRecord)
              : (data as PatientMedicalRecord);
          if (candidate && typeof candidate._id === 'string') return candidate;
        }
      } catch (primaryError) {
        lastError = primaryError;
        try {
          const data = await apiService.post<PatientMedicalRecord>(path, payload);
          // apiService returns parsed data directly
          if (data && (data as unknown as PatientMedicalRecord)._id) return data as unknown as PatientMedicalRecord;
        } catch (fallbackError) {
          lastError = fallbackError;
          // try next
        }
      }
    }
    if (lastError) {
      throw new Error(extractErrorMessage(lastError));
    }
    return null;
  },

  async update(id: string, payload: {
    blood_type?: string;
    allergies?: string;
    chronic_conditions?: string;
    current_medications?: string;
    medical_history?: string;
    clinical_notes?: string;
    recent_test_summary?: string;
  }): Promise<PatientMedicalRecord | null> {
    const candidates = [
      `/api/patient-medical-records/update/${id}`,
      `/patient-medical-records/update/${id}`,
    ];
    for (const path of candidates) {
      try {
        const res = await pmrApiClient.put(path, payload);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (res as any).data ?? res;
        if (data && typeof data === 'object') {
          const obj = data as Record<string, unknown>;
          const candidate = (obj.record && typeof obj.record === 'object')
            ? (obj.record as PatientMedicalRecord)
            : (obj.data && typeof obj.data === 'object')
              ? (obj.data as PatientMedicalRecord)
              : (data as PatientMedicalRecord);
          if (candidate && typeof candidate._id === 'string') return candidate;
        }
      } catch {
        try {
          const data = await apiService.put<PatientMedicalRecord>(path, payload);
          if (data && (data as unknown as PatientMedicalRecord)._id) return data as unknown as PatientMedicalRecord;
        } catch {
          // try next
        }
      }
    }
    return null;
  },

  async remove(id: string): Promise<boolean> {
    const candidates = [
      `/api/patient-medical-records/delete/${id}`,
      `/patient-medical-records/delete/${id}`,
    ];
    for (const path of candidates) {
      try {
        const res = await pmrApiClient.delete(path);
        // success if 2xx
        if (res.status >= 200 && res.status < 300) return true;
      } catch {
        try {
          await apiService.delete(path);
          return true;
        } catch {
          // try next
        }
      }
    }
    return false;
  },
};

export default patientMedicalRecordService;


