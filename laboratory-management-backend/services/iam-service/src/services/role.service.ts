import { roleRepository } from "../repositories/index.js";
import { logEvent } from "../utils/logging.util.js";

import type { IRole } from "../db/models/Role.model.js";
import {
  PaginationResponse,
  PaginationOptions,
} from "../types/pagination.type.js";
import { PaginationUtils } from "../utils/pagination.util.js";
import { isValidPrivilegeCode } from "../constants/privileges.constant.js";
import { computeChanges } from "../utils/diff.util.js";
import { isValidRoleCode } from "../constants/roles.constant.js";

export interface CreateRoleData {
  roleCode: string;
  roleName: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  privileges?: string[];
}

export interface UpdateRoleData {
  roleCode?: string;
  roleName?: string;
  description?: string;
  isSystemRole?: boolean;
  isActive?: boolean;
  privileges?: string[];
}

export class RoleService {
  async getRole(roleId: string): Promise<IRole | null> {
    return await roleRepository.findById(
      roleId,
      "_id roleCode roleName description isSystemRole isActive privileges"
    );
  }

  async createRole(
    roleData: CreateRoleData,
    performedBy?: string
  ): Promise<IRole> {
    // Check for duplicate role code
    const existingRole = await roleRepository.findOne({
      roleCode: roleData.roleCode,
    });
    if (existingRole) {
      throw new Error("Role with this code already exists");
    }

    if (roleData.privileges && roleData.privileges.length > 0) {
      const invalidPrivileges = roleData.privileges.filter(
        (priv) => !isValidPrivilegeCode(priv)
      );
      if (invalidPrivileges.length > 0) {
        throw new Error(
          `Invalid privilege codes: ${invalidPrivileges.join(", ")}`
        );
      }
    }

    if (!isValidRoleCode(roleData.roleCode)) {
      throw new Error("Invalid role code");
    }

    const newRole = await roleRepository.create(roleData);

    const createFields: (keyof IRole)[] = [
      "roleCode",
      "roleName",
      "description",
      "isSystemRole",
      "isActive",
      "privileges",
    ];
    const createDiffs = computeChanges<IRole>(
      undefined,
      newRole ?? undefined,
      createFields
    );

    await logEvent({
      eventCode: "E_00028",
      action: "CREATE",
      eventMessage: `Role ${newRole.roleCode} created successfully!`,
      performedBy: performedBy || "Unknown",
      serviceName: "IAM_SERVICE",
      entityId: newRole._id,
      ...createDiffs,
    });
    return newRole;
  }

  async updateRole(
    roleId: string,
    roleData: UpdateRoleData,
    performedBy?: string
  ): Promise<IRole | null> {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found");
    }

    if (
      role.isSystemRole &&
      (roleData.roleCode || roleData.isSystemRole === false)
    ) {
      throw new Error("Cannot modify system role code or system role status");
    }

    if (roleData.roleCode && roleData.roleCode !== role.roleCode) {
      const existingRole = await roleRepository.findOne({
        roleCode: roleData.roleCode,
      });
      if (existingRole) {
        throw new Error("Role with this code already exists");
      }
    }

    if (roleData.privileges && roleData.privileges.length === 0) {
      throw new Error("Privileges can't be empty");
    }

    if (roleData.privileges && roleData.privileges.length > 0) {
      const invalidPrivileges = roleData.privileges.filter(
        (priv) => !isValidPrivilegeCode(priv)
      );
      if (invalidPrivileges.length > 0) {
        throw new Error(
          `Invalid privilege codes: ${invalidPrivileges.join(", ")}`
        );
      }
    }

    const oldValues = {
      roleCode: role.roleCode,
      roleName: role.roleName,
      description: role.description,
      isSystemRole: role.isSystemRole,
      isActive: role.isActive,
      privileges: role.privileges,
    } as Record<string, unknown>;

    const updatedRole = await roleRepository.updateById(roleId, roleData);

    const newValues = {
      roleCode: updatedRole?.roleCode,
      roleName: updatedRole?.roleName,
      description: updatedRole?.description,
      isSystemRole: updatedRole?.isSystemRole,
      isActive: updatedRole?.isActive,
      privileges: updatedRole?.privileges,
    } as Record<string, unknown>;

    const fields: (keyof IRole)[] = [
      "roleCode",
      "roleName",
      "description",
      "isSystemRole",
      "isActive",
      "privileges",
    ];

    const diffs = computeChanges<IRole>(
      oldValues ?? undefined,
      newValues ?? undefined,
      fields
    );

    await logEvent({
      eventCode: "E_00029",
      action: "UPDATE",
      eventMessage: `Role ${updatedRole?.roleCode} updated successfully!`,
      performedBy: performedBy || "Unknown",
      serviceName: "IAM_SERVICE",
      entityId: roleId,
      ...diffs,
    });

    return updatedRole;
  }

  async deleteRole(
    roleId: string,
    performedBy?: string
  ): Promise<IRole | null> {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found");
    }

    // Prevent deletion of system roles
    if (role.isSystemRole) {
      throw new Error("Cannot delete system roles");
    }

    const deletedRole = await roleRepository.deleteById(roleId);
    const deleteFields: (keyof IRole)[] = [
      "roleCode",
      "roleName",
      "description",
      "isSystemRole",
      "isActive",
      "privileges",
    ];
    const deleteDiffs = computeChanges<IRole>(
      role ?? undefined,
      undefined,
      deleteFields
    );
    await logEvent({
      eventCode: "E_00030",
      action: "DELETE",
      eventMessage: `Role ${deletedRole?.roleCode} deleted successfully!`,
      performedBy: performedBy || "Unknown",
      serviceName: "IAM_SERVICE",
      entityId: roleId,
      ...deleteDiffs,
    });
    return deletedRole;
  }

  async assignPrivilegesToRole(
    roleId: string,
    privileges: string[],
    performedBy: string = "system"
  ): Promise<IRole | null> {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found");
    }

    if (!privileges || privileges.length === 0) {
      throw new Error("Privileges can't be empty ");
    }

    if (role.isSystemRole) {
      throw new Error("Cannot modify privileges of system role");
    }

    const invalidPrivileges = privileges.filter(
      (priv) => !isValidPrivilegeCode(priv)
    );
    if (invalidPrivileges.length > 0) {
      throw new Error(
        `Invalid privilege codes: ${invalidPrivileges.join(", ")}`
      );
    }

    const updatedPrivileges = [...new Set([...role.privileges, ...privileges])];
    return this.updateRole(
      role._id,
      { privileges: updatedPrivileges },
      performedBy
    );
  }

  async removePrivilegesFromRole(
    roleId: string,
    privileges: string[],
    performedBy: string = "system"
  ): Promise<IRole | null> {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found");
    }

    if (!privileges || privileges.length === 0) {
      throw new Error("Privileges can't be empty");
    }

    if (role.isSystemRole) {
      throw new Error("Cannot modify privileges of system role");
    }

    const updatedPrivileges = role.privileges.filter(
      (priv: string) => !privileges.includes(priv)
    );

    if (updatedPrivileges.length === 0) {
      throw new Error("Cannot remove all privileges from a role");
    }

    return this.updateRole(
      role._id,
      { privileges: updatedPrivileges },
      performedBy
    );
  }

  async roleExists(roleId: string): Promise<boolean> {
    const role = await roleRepository.findById(roleId, "_id");
    return !!role;
  }

  async getRoleByCode(roleCode: string): Promise<IRole | null> {
    return await roleRepository.findOne({ roleCode });
  }

  async getRolesWithPagination(
    options: PaginationOptions
  ): Promise<PaginationResponse<IRole>> {
    const result = await roleRepository.findWithPagination(options);
    return PaginationUtils.formatResponse(
      result.data,
      result.hasNextPage,
      options,
      result.totalCount
    );
  }
}
