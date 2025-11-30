import { describe, it, beforeEach, expect, vi } from "vitest";
import { RoleService } from "../../services/role.service.js";
import * as RepositoryIndex from "../../repositories/index.js";
import * as PaginationModule from "../../utils/pagination.util.js";
import type { PaginationOptions } from "../../types/pagination.type.js";
import * as LoggingModule from "../../utils/logging.util.js";

const role = {
  _id: "R-0001",
  roleCode: "ROLE_0001",
  roleName: "Role 1",
  description: "Role 1 description",
  isSystemRole: false,
  isActive: true,
  privileges: ["read:user", "update:user"],
} as any;

let repoResult = role;

describe("RoleService - getRolesWithPagination", () => {
  let roleService: RoleService;

  beforeEach(() => {
    roleService = new RoleService();
    vi.clearAllMocks();
  });

  it("should return formatted pagination response", async () => {
    const options: PaginationOptions = {
      limit: 10,
      sortBy: "updatedAt",
      sortOrder: "desc",
    };

    const roles = [
      {
        _id: "role-1",
        roleCode: "ROLE_0001",
        roleName: "Role 1",
        description: "Role 1 description",
        isSystemRole: true,
        isActive: true,
        privileges: ["PRIVILEGE_0001", "PRIVILEGE_0002"],
      },
    ] as any[];

    const repoResult = {
      data: roles,
      hasNextPage: true,
      totalCount: 15,
    };

    const formattedResponse = {
      data: roles,
      pagination: {
        hasNextPage: true,
        hasPreviousPage: false,
        nextCursor: "role-1",
        previousCursor: undefined,
        totalCount: 15,
        limit: options.limit,
      },
    };

    const findWithPaginationMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findWithPagination")
      .mockResolvedValue(repoResult as any);

    const formatResponseMock = vi
      .spyOn(PaginationModule.PaginationUtils, "formatResponse")
      .mockReturnValue(formattedResponse as any);

    const result = await roleService.getRolesWithPagination(options);

    expect(findWithPaginationMock).toHaveBeenCalledTimes(1);
    expect(findWithPaginationMock).toHaveBeenCalledWith(options);

    expect(formatResponseMock).toHaveBeenCalledTimes(1);
    expect(formatResponseMock).toHaveBeenCalledWith(
      repoResult.data,
      repoResult.hasNextPage,
      options,
      repoResult.totalCount
    );

    expect(result).toEqual(formattedResponse);
  });
});

describe("roleService - getRole", () => {
  let roleService: RoleService;

  beforeEach(() => {
    roleService = new RoleService();
    vi.clearAllMocks();
  });

  it("should return role", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(repoResult as any);

    const result = await roleService.getRole(role._id);

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(
      role._id,
      "_id roleCode roleName description isSystemRole isActive privileges"
    );

    expect(result).toEqual(repoResult);
  });
});

describe("roleService - createRole", () => {
  let roleService: RoleService;

  beforeEach(() => {
    roleService = new RoleService();
    vi.clearAllMocks();
  });

  it("should create a new role", async () => {
    const newRole = {
      roleCode: "ROLE_0001",
      roleName: "Role 1",
      description: "Role 1 description",
      isSystemRole: false,
      isActive: true,
      privileges: ["read:user"],
    } as any;

    const findOneMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findOne")
      .mockResolvedValue(null as any);

    const createMock = vi
      .spyOn(RepositoryIndex.roleRepository, "create")
      .mockResolvedValue(newRole as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await roleService.createRole(newRole);

    expect(findOneMock).toHaveBeenCalledTimes(1);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        roleCode: newRole.roleCode,
        roleName: newRole.roleName,
        description: newRole.description,
        isSystemRole: newRole.isSystemRole,
        isActive: newRole.isActive,
        privileges: newRole.privileges,
      })
    );

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(newRole);
  });
});

describe("roleService - updateRole", () => {
  let roleService: RoleService;

  beforeEach(() => {
    roleService = new RoleService();
    vi.clearAllMocks();
  });

  it("should update a role", async () => {
    const updateData = {
      roleCode: "ROLE_012",
      roleName: "Role 12",
      privileges: ["delete:user"]
    } as any;

    const repoResult = {
      ...role,
      roleCode: updateData.roleCode,
      roleName: updateData.roleName,
      privileges: updateData.privileges
    };

    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.roleRepository, "updateById")
      .mockResolvedValue(repoResult as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await roleService.updateRole(role._id, updateData);

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(role._id);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(role._id, updateData);

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(repoResult);
  });

  it("should update with no field", async () => {
    const updateData = {} as any;

    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.roleRepository, "updateById")
      .mockResolvedValue(role as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await roleService.updateRole(role._id, updateData);

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(role._id);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(role._id, updateData);

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(role);
  });

  it("should throw when role does not exist", async () => {
    const updateData = {
      roleCode: "ROLE_012",
      roleName: "Role 12",
    } as any;

    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(null as any);

    await expect(
      roleService.updateRole("nonexistent-id", updateData)
    ).rejects.toThrow("Role not found");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith("nonexistent-id");
  });

  it("should replace privilege(s)", async () => {
    const updateData = ["delete:user"];

    const repoResult = {
        ...role,
        privileges: updateData
    }

    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.roleRepository, "updateById")
      .mockResolvedValue(repoResult as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await roleService.updateRole(role._id, {
        privileges: updateData
    });

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(role._id);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(role._id, {
        privileges: repoResult.privileges
    });

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(repoResult);
  });

  it("should throw when update system role", async () => {
    const systemRole = { ...role, isSystemRole: true };
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(systemRole as any);

    await expect(
      roleService.updateRole(systemRole._id, {isSystemRole: false})
    ).rejects.toThrow("Cannot modify system role code or system role status");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(systemRole._id);
  });
});

describe("roleService - deleteRole", () => {
  let roleService: RoleService;

  beforeEach(() => {
    roleService = new RoleService();
    vi.clearAllMocks();
  });

  it("should delete a role", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    const deleteMock = vi
      .spyOn(RepositoryIndex.roleRepository, "deleteById")
      .mockResolvedValue(role as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await roleService.deleteRole(role._id);

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(role._id);

    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toHaveBeenCalledWith(role._id);

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(role);
  });

  it("should throw when role does not exist", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(null as any);

    await expect(roleService.deleteRole("nonexistent-id")).rejects.toThrow(
      "Role not found"
    );

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith("nonexistent-id");
  });

  it("should throw when delete system role", async () => {
    const systemRole = { ...role, isSystemRole: true };
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(systemRole as any);

    await expect(
      roleService.deleteRole(systemRole._id)
    ).rejects.toThrow("Cannot delete system roles");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(systemRole._id);
  });
});

describe("roleService - assignPrivilegesToRole", () => {
  let roleService: RoleService;

  beforeEach(() => {
    roleService = new RoleService();
    vi.clearAllMocks();
  });

  it("should assign privilege(s) to a role", async () => {
    const updateData = ["delete:user"];

    const repoResult = {
      ...role,
      privileges: role.privileges.concat(updateData),
    };

    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.roleRepository, "updateById")
      .mockResolvedValue(repoResult as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await roleService.assignPrivilegesToRole(
      role._id,
      updateData
    );

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(findMock).toHaveBeenCalledWith(role._id);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(role._id, {
      privileges: repoResult.privileges,
    });

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(repoResult);
  });

  it("should throw when user does not exist", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(null as any);

    await expect(
      roleService.assignPrivilegesToRole("nonexistent-id", ["delete:user"])
    ).rejects.toThrow("Role not found");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith("nonexistent-id");
  });

  it("should throw when invalid privilege codes are provided", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    await expect(
      roleService.assignPrivilegesToRole(role._id, ["invalid:priv", "fake:code"])
    ).rejects.toThrow("Invalid privilege codes: invalid:priv, fake:code");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(role._id);
  });

  it("should throw when empty privileges array is provided", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    await expect(
      roleService.assignPrivilegesToRole(role._id, [])
    ).rejects.toThrow("Privileges can't be empty");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(role._id);
  });

  it("should throw when trying to assign privileges to system role", async () => {
    const systemRole = { ...role, isSystemRole: true };
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(systemRole as any);

    await expect(
      roleService.assignPrivilegesToRole(systemRole._id, ["delete:user"])
    ).rejects.toThrow("Cannot modify privileges of system role");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(systemRole._id);
  });

  it("should handle database failures during assignment", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.roleRepository, "updateById")
      .mockRejectedValue(new Error("Database connection failed"));

    await expect(
      roleService.assignPrivilegesToRole(role._id, ["delete:user"])
    ).rejects.toThrow("Database connection failed");

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledTimes(1);
  });
});

describe("roleService - removePrivilegesFromRole", () => {
  let roleService: RoleService;

  beforeEach(() => {
    roleService = new RoleService();
    vi.clearAllMocks();
  });

  it("should remove privilege(s) to a role", async () => {
    const updateData = ["read:user"];

    const repoResult = {
      ...role,
      privileges: role.privileges.filter(
        (privilege: string) => !updateData.includes(privilege)
      ),
    };

    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.roleRepository, "updateById")
      .mockResolvedValue(repoResult as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await roleService.removePrivilegesFromRole(
      role._id,
      updateData
    );

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(findMock).toHaveBeenCalledWith(role._id);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(role._id, {
      privileges: repoResult.privileges,
    });

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(repoResult);
  });

  it("should throw when user does not exist", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(null as any);

    await expect(
      roleService.removePrivilegesFromRole("nonexistent-id", ["delete:user"])
    ).rejects.toThrow("Role not found");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith("nonexistent-id");
  });

  it("should throw when trying to remove privileges from system role", async () => {
    const systemRole = { ...role, isSystemRole: true };
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(systemRole as any);

    await expect(
      roleService.removePrivilegesFromRole(systemRole._id, ["read:user"])
    ).rejects.toThrow("Cannot modify privileges of system role");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(systemRole._id);
  });

  it("should throw when trying to remove all privileges from role", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    await expect(
      roleService.removePrivilegesFromRole(role._id, role.privileges)
    ).rejects.toThrow("Cannot remove all privileges from a role");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(role._id);
  });

  it("should handle removing non-existent privileges gracefully", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.roleRepository, "updateById")
      .mockResolvedValue(role as any);

    const result = await roleService.removePrivilegesFromRole(
      role._id,
      ["nonexistent:priv", "fake:code"]
    );

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(role._id, {
      privileges: role.privileges,
    });
    expect(result).toEqual(role);
  });

  it("should throw when empty privileges array is provided", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.roleRepository, "findById")
      .mockResolvedValue(role as any);

    await expect(
      roleService.removePrivilegesFromRole(role._id, [])
    ).rejects.toThrow("Privileges can't be empty");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(role._id);
  });
});
