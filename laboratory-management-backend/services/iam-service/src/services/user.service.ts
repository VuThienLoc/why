import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/index.js";
import { passwordHistoryRepository } from "../repositories/index.js";

import type { IUser } from "../db/models/User.model.js";
import RoleModel from "../db/models/Role.model.js";
import {
  PaginationResponse,
  PaginationOptions,
} from "../types/pagination.type.js";
import { PaginationUtils } from "../utils/pagination.util.js";
import { logEvent } from "../utils/logging.util.js";
import { computeChanges } from "../utils/diff.util.js";
import { AppError } from "../utils/error.util.js";
import notifServiceClient from "../../../shared/src/notif-service/adapter/notif.adapter.js";
import { isValidRoleCode, ROLE_CODES } from "../constants/roles.constant.js";
import patientServiceClient from "./patientService.client.js";

export interface CreateUserData {
  email: string;
  fullName: string;
  identityNumber: string;
  gender?: string;
  age?: number;
  dateOfBirth?: Date;
  password?: string;
  phoneNumber?: string;
  address?: string;
  role?: string[];
  provider?: string;
  providerId?: string;
  avatar?: string;
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  identityNumber?: string;
  gender?: string;
  age?: number;
  dateOfBirth?: Date;
  password?: string;
  phoneNumber?: string;
  address?: string;
  role?: string[];
  lastPasswordChange?: Date;
  isActive?: boolean;
  avatar?: string;
}

export class UserService {
  async getUser(userId: string): Promise<IUser | null> {
    return await userRepository.findById(
      userId,
      "_id email fullName phoneNumber avatar identityNumber gender age dateOfBirth address role isActive"
    );
  }

  async getUsersWithPagination(
    options: PaginationOptions
  ): Promise<PaginationResponse<IUser>> {
    const result = await userRepository.findWithPagination(options);
    return PaginationUtils.formatResponse(
      result.data,
      result.hasNextPage,
      options,
      result.totalCount
    );
  }

  async createUser(
    userData: CreateUserData,
    performedBy?: string
  ): Promise<IUser> {
    const { data: newUser } = await this._passwordCheck(
      "",
      { ...userData, lastPasswordChange: new Date() },
      performedBy
    );
    if (!userData.role) {
      newUser.role = ["USER"];
    }

    const createdUser = await userRepository.create(newUser);

    console.log("[AuthController] Auto-creating patient for user role USER");
    await patientServiceClient.createPatientForUser(String(createdUser._id), {
      id: String(createdUser._id),
      email: createdUser.email,
    });

    await logEvent({
      eventCode: "E_00023",
      action: "CREATE",
      eventMessage: "User created successfully!",
      performedBy: performedBy || createdUser._id,
      serviceName: "IAM_SERVICE",
      entityId: createdUser._id,
      newValues: {
        email: createdUser.email,
        fullName: createdUser.fullName,
        phoneNumber: createdUser.phoneNumber,
        address: createdUser.address,
        role: createdUser.role,
        isActive: createdUser.isActive,
        gender: createdUser.gender,
        age: createdUser.age,
        dateOfBirth: createdUser.dateOfBirth,
        identityNumber: createdUser.identityNumber,
      },
    });
    return createdUser;
  }

  async updateUser(
    userId: string,
    userData: UpdateUserData,
    performedBy?: string
  ): Promise<IUser | null> {
    const before = await userRepository.findById(userId);
    if (!before) {
      throw new Error("User not found");
    }
    const { data: newUser, passwordChanged } = await this._passwordCheck(
      userId,
      userData,
      performedBy
    );
    const updatedUser = await userRepository.updateById(userId, newUser);

    const fields: (keyof IUser)[] = [
      "email",
      "fullName",
      "phoneNumber",
      "address",
      "isActive",
      "avatar",
      "gender",
      "age",
      "dateOfBirth",
      "identityNumber",
    ];

    if (typeof userData.role !== "undefined") {
      fields.push("role");
    }

    const diffs = computeChanges<IUser>(
      before ?? undefined,
      updatedUser ?? undefined,
      fields,
      passwordChanged ? { passwordChanged: true } : undefined
    );

    await logEvent({
      eventCode: "E_00025",
      action: "UPDATE",
      eventMessage: "User updated successfully!",
      performedBy: performedBy || userId,
      serviceName: "IAM_SERVICE",
      entityId: userId,
      ...diffs,
    });

    return updatedUser;
  }

  async updateUserInternal(
    userId: string,
    userData: UpdateUserData,
    performedBy?: string
  ): Promise<IUser | null> {
    const before = await userRepository.findById(userId);
    if (!before) {
      throw new Error("User not found");
    }
    const { data: newUser, passwordChanged } = await this._passwordCheck(
      userId,
      userData,
      performedBy
    );
    const updatedUser = await userRepository.updateById(userId, newUser);

    const fields: (keyof IUser)[] = [
      "email",
      "fullName",
      "phoneNumber",
      "address",
      "isActive",
      "avatar",
    ];

    if (typeof userData.role !== "undefined") {
      fields.push("role");
    }

    const diffs = computeChanges<IUser>(
      before ?? undefined,
      updatedUser ?? undefined,
      fields,
      passwordChanged ? { passwordChanged: true } : undefined
    );

    return updatedUser;
  }

  async deleteUser(
    userId: string,
    performedBy?: string
  ): Promise<IUser | null> {
    const before = await userRepository.findById(userId);
    if (!before) {
      throw new Error("User not found");
    }
    const deletedUser = await userRepository.deleteById(userId);
    const deleteFields: (keyof IUser)[] = [
      "email",
      "fullName",
      "phoneNumber",
      "address",
      "role",
      "isActive",
      "gender",
      "age",
      "dateOfBirth",
      "identityNumber",
    ];
    const deleteDiffs = computeChanges<IUser>(
      before ?? undefined,
      undefined,
      deleteFields
    );
    await logEvent({
      eventCode: "E_00026",
      action: "DELETE",
      eventMessage: "User deleted successfully!",
      performedBy: performedBy || userId,
      serviceName: "IAM_SERVICE",
      entityId: userId,
      ...deleteDiffs,
    });
    return deletedUser;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await userRepository.findByEmail(email);
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<IUser | null> {
    return await userRepository.findByPhoneNumber(phoneNumber);
  }

  async searchUsersByFullName(
    keyword: string,
    limit: number = 20
  ): Promise<IUser[]> {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }
    return await userRepository.searchByFullName(
      keyword.trim(),
      "_id fullName email phoneNumber",
      limit
    );
  }

  async getLatestPasswordHistory(userId: string) {
    return passwordHistoryRepository.findLatestByUserId(userId);
  }

  async assignRoleToUser(
    userId: string,
    role: string[],
    performedBy?: string
  ): Promise<IUser | null> {
    const before = await userRepository.findById(userId);
    if (!before) {
      throw new Error("User not found");
    }

    if (role.length === 0 || !role.every((r) => isValidRoleCode(r))) {
      throw new Error("Invalid role(s)");
    }

    const updatedUser = await userRepository.updateById(userId, { role });
    const roleFields: (keyof IUser)[] = ["role"];
    const roleDiffs = computeChanges<IUser>(
      before ?? undefined,
      updatedUser ?? undefined,
      roleFields
    );
    await logEvent({
      eventCode: "E_00025",
      action: "UPDATE",
      eventMessage: "User updated successfully!",
      performedBy: performedBy || userId,
      serviceName: "IAM_SERVICE",
      entityId: userId,
      ...roleDiffs,
    });

    if (updatedUser) {
      await notifServiceClient.notifyRoleChanged(
        updatedUser._id.toString(),
        (updatedUser.role || []).join(", ")
      );
    }
    return updatedUser;
  }

  async lockUser(
    userId: string,
    isActive: boolean,
    performedBy?: string
  ): Promise<IUser | null> {
    const before = await userRepository.findById(userId);
    if (!before) {
      throw new Error("User not found");
    }
    const updatedUser = await userRepository.updateById(userId, { isActive });
    const lockFields: (keyof IUser)[] = ["isActive"];
    const lockDiffs = computeChanges<IUser>(
      before ?? undefined,
      updatedUser ?? undefined,
      lockFields
    );
    await logEvent({
      eventCode: "E_00027",
      action: `${isActive ? "UNLOCK" : "LOCK"}`,
      eventMessage: "User locked/unlocked successfully!",
      performedBy: performedBy || userId,
      serviceName: "IAM_SERVICE",
      entityId: userId,
      ...lockDiffs,
    });
    return updatedUser;
  }

  async getUserRolesAndPrivileges(userId: string): Promise<any> {
    const user = await userRepository.findById(
      userId,
      "_id email fullName role isActive isDeleted"
    );

    if (!user) {
      return null;
    }

    const roles = await RoleModel.find({
      roleCode: { $in: user.role },
    }).select(
      "_id roleCode roleName description privileges isActive isSystemRole"
    );

    return {
      userId: user._id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      isDeleted: user.isDeleted,
      roles: roles.map((role) => ({
        _id: role._id,
        roleCode: role.roleCode,
        roleName: role.roleName,
        description: role.description,
        privileges: role.privileges,
        isActive: role.isActive,
        isSystemRole: role.isSystemRole,
      })),
    };
  }

  private async _passwordCheck(
    userId: string,
    userData: UpdateUserData | CreateUserData,
    performedBy?: string
  ): Promise<{
    data: UpdateUserData | CreateUserData;
    passwordChanged: boolean;
  }> {
    const existing = userId
      ? await userRepository.findById(userId, "passwordHash")
      : null;
    // Skip password hashing for OAuth users
    if (userData.password) {
      if (existing?.passwordHash) {
        const isMatch = await bcrypt.compare(
          userData.password,
          existing.passwordHash as string
        );
        if (isMatch) {
          throw new AppError(
            400,
            "New password must be different from the current password"
          );
        }
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const newUser = {
        ...userData,
        passwordHash: hashedPassword,
        lastPasswordChange: new Date(),
      };

      try {
        if (userId) {
          await passwordHistoryRepository.create({
            userId: userId || "",
            passwordHash: hashedPassword,
            changedAt: new Date(),
            changedBy: performedBy || userId,
            changedReason: "Password changed through updating user!",
          });
        }
      } catch (error) {
        console.log(error);
      }

      delete (newUser as any).password;
      return { data: newUser, passwordChanged: true };
    } else return { data: userData, passwordChanged: false };
  }
}
