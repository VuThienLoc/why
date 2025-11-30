export const MonitoringEventCodes = {
  TEST_ORDER_CREATED: "E_00001",
  TEST_ORDER_UPDATED: "E_00002",
  TEST_ORDER_DELETED: "E_00003",
} as const;

export const MonitoringEventActions = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export const MonitoringServiceName = "TEST_ORDER_SERVICE";

export type MonitoringServiceNameType = typeof MonitoringServiceName;
