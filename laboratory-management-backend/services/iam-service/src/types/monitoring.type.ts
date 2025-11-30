/**
 * Monitoring event types - aligned with monitoringService schema
 * No runtime coupling - these are just type definitions
 */

export type ServiceName = 
  | "IAM_SERVICE"
  | "PATIENT_SERVICE"
  | "TEST_ORDER_SERVICE"
  | "WAREHOUSE_SERVICE"
  | "MONITORING_SERVICE"
  | "CHAT_SERVICE";

export interface MonitoringEvent {
  event_code: string;
  action: string;
  event_message: string;
  service_name: ServiceName;
  entity_id?: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  operator_id: string;
  operator_name?: string;
  operator_gmail?: string;
  operator_role?: string;
  operator_avatar?: string;
  occurred_at?: Date;
  error_message?: string;
}

export interface MonitoringEventResponse {
  message: string;
  eventLog?: {
    event_id: string;
    [key: string]: unknown;
  };
}
