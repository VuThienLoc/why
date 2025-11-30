import { isValidRoleCode } from "../constants/roles.constant.js";
import { isValidPrivilegeCode } from "../constants/privileges.constant.js";

export const validateRole = (value: string): boolean => {
  return isValidRoleCode(value);
};

export const validatePrivileges = (value: string): boolean => {
  return isValidPrivilegeCode(value);
};

export const roleValidationMessages = {
  'any.invalid': 'Invalid role code'
};