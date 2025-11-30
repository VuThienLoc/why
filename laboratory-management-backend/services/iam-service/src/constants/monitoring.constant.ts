export const MonitoringEventCodes = {
  USER_CREATED: "E_00023",
  USER_PASSWORD_CHANGED: "E_00024",
  USER_UPDATED: "E_00025",
  USER_DELETED: "E_00026",
  USER_LOCK_STATUS_CHANGED: "E_00010",
  ROLE_CREATED: "E_00028",
  ROLE_UPDATED: "E_00029",
  ROLE_DELETED: "E_00030",
} as const;

export const MonitoringEventActions = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOCK: "LOCK",
  UNLOCK: "UNLOCK",
} as const;

export const MonitoringServiceName = "IAM_SERVICE" as const;

export type MonitoringEventCode =
  (typeof MonitoringEventCodes)[keyof typeof MonitoringEventCodes];
export type MonitoringEventAction =
  (typeof MonitoringEventActions)[keyof typeof MonitoringEventActions];
export type MonitoringServiceNameType = typeof MonitoringServiceName;
