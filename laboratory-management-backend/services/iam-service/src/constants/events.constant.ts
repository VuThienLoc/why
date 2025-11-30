// Audit Log Event Constants
export const AUDIT_EVENT_CODES = [
  'E_00023', 'E_00024',
  'E_00025', 'E_00026', 'E_00027', 'E_00028', 'E_00029', 'E_00030'
] as const;

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOCK',
  'UNLOCK',
] as const;

// Type definitions for better type safety
export type AuditEventCode = typeof AUDIT_EVENT_CODES[number];
export type AuditAction = typeof AUDIT_ACTIONS[number];

// Event code descriptions for documentation
export const EVENT_CODE_DESCRIPTIONS: Record<AuditEventCode, string> = {
  'E_00023': 'Account creation',
  'E_00024': 'Password change',
  'E_00025': 'Profile update',
  'E_00026': 'Account deletion',
  'E_00027': 'User lock/unlock',

  'E_00028': 'Role creation',
  'E_00029': 'Role update',
  'E_00030': 'Role deletion'
};