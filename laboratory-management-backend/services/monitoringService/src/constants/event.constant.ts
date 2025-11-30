// ============================================
// EVENT CODES CONSTANTS
// Based on Section 2.8 Event Table
// ============================================

export const EVENT_CODES = {
  TEST_ORDER_CREATED: "E_00001",
  TEST_ORDER_UPDATED: "E_00002",
  TEST_ORDER_DELETED: "E_00003",
  TEST_RESULT_MODIFIED: "E_00004",
  COMMENT_ADDED: "E_00005",
  COMMENT_MODIFIED: "E_00006",
  COMMENT_DELETED: "E_00007",
  REVIEW_COMPLETED: "E_00008",
  INSTRUMENT_ACTIVATION_CHANGED: "E_00009",
  USER_LOCK_STATUS_CHANGED: "E_00010",
  USER_CREATED: "E_00023",
  USER_PASSWORD_CHANGED: "E_00024",
  USER_UPDATED: "E_00025",
  USER_DELETED: "E_00026",
  PATIENT_CREATED: "E_00011",
  PATIENT_UPDATED: "E_00012",
  PATIENT_DELETED: "E_00013",
  MEDICAL_RECORD_CREATED: "E_00014",
  MEDICAL_RECORD_UPDATED: "E_00015",
  MEDICAL_RECORD_DELETED: "E_00016",
  INSTRUMENT_CREATED: "E_00017",
  INSTRUMENT_UPDATED: "E_00018",
  INSTRUMENT_DELETED: "E_00019",
  REAGENT_CREATED: "E_00020",
  REAGENT_UPDATED: "E_00021",
  REAGENT_DELETED: "E_00022",
  ROLE_CREATED: "E_00028",
  ROLE_UPDATED: "E_00029",
  ROLE_DELETED: "E_00030",
} as const;

export const SERVICE_NAMES = {
  IAM_SERVICE: "IAM_SERVICE",
  PATIENT_SERVICE: "PATIENT_SERVICE",
  TEST_ORDER_SERVICE: "TEST_ORDER_SERVICE",
  WAREHOUSE_SERVICE: "WAREHOUSE_SERVICE",
  MONITORING_SERVICE: "MONITORING_SERVICE",
  CHAT_SERVICE: "CHAT_SERVICE",
} as const;

export type ServiceName = (typeof SERVICE_NAMES)[keyof typeof SERVICE_NAMES];

export const LEGACY_SERVICE_NAMES = {
  IAM: "IAM",
  PATIENT: "PATIENT",
  TEST_ORDER: "TEST_ORDER",
  WAREHOUSE: "WAREHOUSE",
  INSTRUMENT: "INSTRUMENT",
  MONITORING: "MONITORING",
  CHAT: "CHAT",
} as const;

export const SERVICE_NAME_ENUM: ServiceName[] = Object.values(SERVICE_NAMES);

export const SERVICE_NAME_ALIASES: Record<string, ServiceName> = {
  IAM: SERVICE_NAMES.IAM_SERVICE,
  PATIENT: SERVICE_NAMES.PATIENT_SERVICE,
  TEST_ORDER: SERVICE_NAMES.TEST_ORDER_SERVICE,
  WAREHOUSE: SERVICE_NAMES.WAREHOUSE_SERVICE,
  INSTRUMENT: SERVICE_NAMES.WAREHOUSE_SERVICE,
  MONITORING: SERVICE_NAMES.MONITORING_SERVICE,
  CHAT: SERVICE_NAMES.CHAT_SERVICE,
  IAM_SERVICE: SERVICE_NAMES.IAM_SERVICE,
  PATIENT_SERVICE: SERVICE_NAMES.PATIENT_SERVICE,
  TEST_ORDER_SERVICE: SERVICE_NAMES.TEST_ORDER_SERVICE,
  WAREHOUSE_SERVICE: SERVICE_NAMES.WAREHOUSE_SERVICE,
  MONITORING_SERVICE: SERVICE_NAMES.MONITORING_SERVICE,
  CHAT_SERVICE: SERVICE_NAMES.CHAT_SERVICE,
};

export const ALLOWED_SERVICE_NAMES: string[] = Array.from(
  new Set([...SERVICE_NAME_ENUM, ...Object.keys(LEGACY_SERVICE_NAMES)])
);

export const normalizeServiceName = (value?: string | null): ServiceName | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized.length === 0) {
    return undefined;
  }

  const aliasHit = SERVICE_NAME_ALIASES[normalized];
  if (aliasHit) {
    return aliasHit;
  }

  if (SERVICE_NAME_ENUM.includes(normalized as ServiceName)) {
    return normalized as ServiceName;
  }

  return undefined;
};

export const resolveServiceNameVariants = (serviceName: ServiceName): string[] => {
  const variants = new Set<string>([serviceName]);
  for (const [alias, target] of Object.entries(SERVICE_NAME_ALIASES)) {
    if (target === serviceName) {
      variants.add(alias);
    }
  }
  return Array.from(variants);
};

export const EVENT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  REVIEW: 'REVIEW',
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
  LOCK: 'LOCK',
  UNLOCK: 'UNLOCK',
} as const;
