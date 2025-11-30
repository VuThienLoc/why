export const ROLE_CODES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SERVICE: "SERVICE",
  LAB_USER: "LAB_USER",
  USER: "USER",
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

export function isValidRoleCode(roleCode: string): boolean {
  return /^[A-Z0-9_]{2,30}$/.test(roleCode);
}
