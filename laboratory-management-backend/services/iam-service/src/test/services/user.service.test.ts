import { describe, it, beforeEach, expect, vi } from "vitest";
import { UserService } from "../../services/user.service.js";
import * as RepositoryIndex from "../../repositories/index.js";
import * as PaginationModule from "../../utils/pagination.util.js";
import type { PaginationOptions } from "../../types/pagination.type.js";
import * as LoggingModule from "../../utils/logging.util.js";
import * as NotifModule from "../../../../shared/src/notif-service/adapter/notif.adapter.js";

const user = {
  _id: "U-0001",
  email: "user1@example.com",
  fullName: "User 1",
  identityNumber: "1234567890",
  phoneNumber: "1234567890",
  address: "123 Main St",
  age: 25,
  dateOfBirth: new Date(),
  role: ["USER"],
  passwordHash: "password123",
  isActive: true,
} as any;

let repoResult = user;

describe("UserService - getUsersWithPagination", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  it("should return formatted pagination response", async () => {
    const options: PaginationOptions = {
      limit: 10,
      sortBy: "updatedAt",
      sortOrder: "desc",
    };

    const users = [
      {
        _id: "user-1",
        email: "user1@example.com",
      },
    ] as any[];

    const repoResult = {
      data: users,
      hasNextPage: true,
      totalCount: 15,
    };

    const formattedResponse = {
      data: users,
      pagination: {
        hasNextPage: true,
        hasPreviousPage: false,
        nextCursor: "user-1",
        previousCursor: undefined,
        totalCount: 15,
        limit: options.limit,
      },
    };

    const findWithPaginationMock = vi
      .spyOn(RepositoryIndex.userRepository, "findWithPagination")
      .mockResolvedValue(repoResult as any);

    const formatResponseMock = vi
      .spyOn(PaginationModule.PaginationUtils, "formatResponse")
      .mockReturnValue(formattedResponse as any);

    const result = await userService.getUsersWithPagination(options);

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

describe("UserService - getUser", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  it("should return user", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(repoResult as any);

    const result = await userService.getUser(user._id);

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(
      user._id,
      "_id email fullName phoneNumber avatar identityNumber gender age dateOfBirth address role isActive"
    );

    expect(result).toEqual(repoResult);
  });
});

describe("UserService - createUser", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  it("should create a new user", async () => {
    const newUser = {
      email: "user1@example.com",
      fullName: "User 1",
      identityNumber: "1234567890",
      phoneNumber: "1234567890",
      address: "123 Main St",
      age: 25,
      dateOfBirth: new Date(),
      password: "password123",
      isActive: true,
    } as any;

    const createMock = vi
      .spyOn(RepositoryIndex.userRepository, "create")
      .mockResolvedValue(newUser as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await userService.createUser(newUser);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: newUser.email,
        fullName: newUser.fullName,
        identityNumber: newUser.identityNumber,
        phoneNumber: newUser.phoneNumber,
        address: newUser.address,
        age: newUser.age,
        dateOfBirth: newUser.dateOfBirth,
        isActive: newUser.isActive,
      })
    );

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(newUser);
  });
});

describe("UserService - updateUser", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  it("should update a user", async () => {
    const updateData = {
      email: "user12@example.com",
      fullName: "User 12",
    } as any;

    const repoResult = {
      ...user,
      email: updateData.email,
      fullName: updateData.fullName,
    };

    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(user as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.userRepository, "updateById")
      .mockResolvedValue(repoResult as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await userService.updateUser(user._id, updateData, user._id);

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(findMock).toHaveBeenCalledWith(user._id);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(user._id, updateData);

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(repoResult);
  });

  it("should update with no field", async () => {
    const updateData = {} as any;

    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(user as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.userRepository, "updateById")
      .mockResolvedValue(user as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await userService.updateUser(user._id, updateData);

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(findMock).toHaveBeenCalledWith(user._id);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(user._id, updateData);

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(user);
  });

  it("should throw when user does not exist", async () => {
    const updateData = {
      email: "123@example.com"
    }
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(null as any);

    await expect(userService.updateUser("nonexistent-id", updateData))
      .rejects.toThrow("User not found");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith("nonexistent-id");
  });
});

describe("UserService - deleteUser", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  it("should delete a user", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(user as any);

    const deleteMock = vi
      .spyOn(RepositoryIndex.userRepository, "deleteById")
      .mockResolvedValue(user as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await userService.deleteUser(user._id);

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(user._id);

    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toHaveBeenCalledWith(user._id);

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(user);
  });

  it("should throw when user does not exist", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(null as any);

    await expect(userService.deleteUser("nonexistent-id"))
      .rejects.toThrow("User not found");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith("nonexistent-id");
  });
});

describe("UserService - assignRoleToUser", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  it("should assign role(s) to user", async () => {
    const updateData = ["LAB_USER"];

    const repoResult = {
      ...user,
      role: updateData
    };

    const notifMock = vi
      .spyOn(NotifModule.default, "notifyRoleChanged")
      .mockResolvedValue(undefined as any);

    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(user as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.userRepository, "updateById")
      .mockResolvedValue(repoResult as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await userService.assignRoleToUser(user._id, updateData);

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(user._id);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(user._id, { role: updateData });

    expect(logMock).toHaveBeenCalledTimes(1);
    expect(notifMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(repoResult);
  });

  it("should throw when user does not exist", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(null as any);

    await expect(userService.assignRoleToUser("nonexistent-id", ["ADMIN"]))
      .rejects.toThrow("User not found");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith("nonexistent-id");
  });

  it("should throw when role is not valid", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(user as any);

    await expect(userService.assignRoleToUser(user._id, ["INVALID ROLE"]))
      .rejects.toThrow("Invalid role(s)");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(user._id);
  });

  it("should throw when role is empty", async () => {
    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(user as any);

    await expect(userService.assignRoleToUser(user._id, []))
      .rejects.toThrow("Invalid role(s)");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(user._id);
  });
});

describe("UserService - lockUser", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  it("should lock/unlock a user", async () => {
    const updateData = false;

    const repoResult = {
      ...user,
      isActive: updateData
    };

    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(user as any);

    const updateMock = vi
      .spyOn(RepositoryIndex.userRepository, "updateById")
      .mockResolvedValue(repoResult as any);

    const logMock = vi
      .spyOn(LoggingModule, "logEvent")
      .mockResolvedValue(undefined as any);

    const result = await userService.lockUser(user._id, updateData);

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(user._id);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(user._id, { isActive: updateData });

    expect(logMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(repoResult);
  });

  it("should throw when user does not exist", async () => {
    const updateData = false;

    const findMock = vi
      .spyOn(RepositoryIndex.userRepository, "findById")
      .mockResolvedValue(null as any);

    await expect(userService.lockUser("nonexistent-id", updateData))
      .rejects.toThrow("User not found");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith("nonexistent-id");
  });
});
