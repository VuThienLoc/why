import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { apiService } from './apiClient';

const EVENTLOG_SERVICE_URL = import.meta.env.VITE_API_MONITORING_SERVICE_URL || 'http://localhost:5004';

const eventLogApiClient: AxiosInstance = axios.create({
  baseURL: EVENTLOG_SERVICE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

eventLogApiClient.interceptors.request.use(
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

export interface EventLog {
  _id?: string;
  id?: string;
  event_id?: string;
  event_code?: string;
  service_name?: string; // chức năng
  action?: string;
  event_message?: string;
  entity_id?: string;
  entity_info?: {
    entity_code?: string;
    entity_name?: string;
    entity_type?: string;
    _id?: string;
  };
  changed_fields?: string[];
  old_values?: unknown;
  new_values?: unknown;
  operator_id?: string; // id column as per spec
  operator_name?: string; // Người dùng
  operator_gmail?: string; // Người dùng email
  operator_avatar?: string;
  occurred_at?: string; // thời gian
  received_at?: string;
}

export interface EventLogsResponse {
  logs: EventLog[];
  total?: number;
  page?: number;
  totalPages?: number;
}


async function tryGet<T>(pathWithQuery: string): Promise<T> {
  try {
    const res = await eventLogApiClient.get<T>(pathWithQuery);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res as any).data ?? (res as any);
  } catch {
    return await apiService.get<T>(pathWithQuery);
  }
}

function pickNumber(...vals: Array<unknown>): number | undefined {
  for (const v of vals) {
    if (typeof v === 'number') return v;
  }
  return undefined;
}

export const eventLogService = {
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    service_name?: string;
    action?: string;
    sort?: 'newest' | 'oldest';
    startDate?: string;
    endDate?: string;
  }): Promise<EventLogsResponse> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const search = params?.search ?? '';
    const service_name = params?.service_name;
    const action = params?.action;
    const sort = params?.sort;
    const startDate = params?.startDate;
    const endDate = params?.endDate;

    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('limit', String(limit));
    if (search) qs.set('search', search);
    if (service_name && service_name !== 'all') qs.set('service_name', service_name);
    if (action && action !== 'all') qs.set('action', action);
    if (sort) qs.set('sort', sort);
    if (startDate) qs.set('start_date', startDate);
    if (endDate) qs.set('end_date', endDate);

    // Use only /event-logs without trailing slash to avoid 404 on some backends
    const endpointCandidates = [
      `/api/event-logs?${qs.toString()}`,
    ];

    for (const ep of endpointCandidates) {
      try {
        const raw = await tryGet<unknown>(ep);
        // normalize shapes: { logs: [...], page, totalPages } or { data: [...] }
        if (raw && typeof raw === 'object') {
          const obj = raw as Record<string, unknown>;
          const logs = (obj.logs as EventLog[]) || (obj.data as EventLog[]) || [];
          if (Array.isArray(logs)) {
            return {
              logs,
              total: pickNumber(obj.total, obj.totalCount),
              page: (obj.page as number) ?? page,
              totalPages: pickNumber(obj.totalPages, obj.total_pages),
            };
          }
        }
      } catch {
        // try next
      }
    }

    return { logs: [], total: 0, page, totalPages: 0 };
  },

  async getById(id: string): Promise<EventLog | null> {
  const ep = `/api/event-logs/${id}`; // id here should be event_id passed from caller
    try {
      const raw = await tryGet<unknown>(ep);
      if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        // Handle different response formats: { eventLog: {...} }, { log: {...} }, or direct object
        const log = (obj.eventLog as EventLog) || (obj.log as EventLog) || (raw as EventLog);
        if (log && (log._id || log.id || log.event_id)) return log;
      }
    } catch {
      // fallback to null on error
    }
    return null;
  },

  async delete(id: string): Promise<boolean> {
  const ep = `/api/event-logs/${id}`; // id here should be event_id passed from caller
    try {
      const res = await eventLogApiClient.delete(ep);
      if (res.status >= 200 && res.status < 300) return true;
    } catch {
      try {
        await apiService.delete(ep);
        return true;
      } catch {
        // fallthrough
      }
    }
    return false;
  },
};

export default eventLogService;
