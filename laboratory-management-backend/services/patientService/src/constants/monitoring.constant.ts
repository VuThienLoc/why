export const MonitoringEventCodes = {
  PATIENT_CREATED: "E_00011",
  PATIENT_UPDATED: "E_00012",
  PATIENT_DELETED: "E_00013",
  MEDICAL_RECORD_CREATED: "E_00014",
  MEDICAL_RECORD_UPDATED: "E_00015",
  MEDICAL_RECORD_DELETED: "E_00016",
} as const;

export const MonitoringEventActions = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export const MonitoringServiceName = "PATIENT_SERVICE" as const;

export type MonitoringEventCode = (typeof MonitoringEventCodes)[keyof typeof MonitoringEventCodes];
export type MonitoringEventAction = (typeof MonitoringEventActions)[keyof typeof MonitoringEventActions];
export type MonitoringServiceNameType = typeof MonitoringServiceName;
