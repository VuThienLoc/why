export const MonitoringEventCodes = {
  INSTRUMENT_CREATED: "E_00017",
  INSTRUMENT_UPDATED: "E_00018",
  INSTRUMENT_DELETED: "E_00019",
  REAGENT_CREATED: "E_00020",
  REAGENT_UPDATED: "E_00021",
  REAGENT_DELETED: "E_00022",
} as const;

export const MonitoringEventActions = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export const MonitoringServiceName = "WAREHOUSE_SERVICE" as const;

export type MonitoringEventCode = (typeof MonitoringEventCodes)[keyof typeof MonitoringEventCodes];
export type MonitoringEventAction = (typeof MonitoringEventActions)[keyof typeof MonitoringEventActions];
export type MonitoringServiceNameType = typeof MonitoringServiceName;
