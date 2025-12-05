import { randomUUID } from "crypto";
import type { IUser } from "../db/models/User.model.js";
import { userRepository } from "../repositories/index.js";
import { UserService } from "./user.service.js";

const userService = new UserService();
export interface CreateOAuthUserData {
  email: string;
  fullName: string;
  provider: "google";
  providerId: string;
  avatar?: string | undefined;
}

export class OAuthService {
  async createOAuthUser(
    userData: CreateOAuthUserData,
    performedBy?: string
  ): Promise<IUser> {
    try {
      // Check if user already exists with this provider ID
      const existingOAuthUser = await this.findUserByProvider(
        userData.provider,
        userData.providerId
      );
      if (existingOAuthUser) {
        return existingOAuthUser;
      }

      const existingEmailUser = await this.findUserByEmailAndProvider(
        userData.email,
        "local"
      );
      if (existingEmailUser) {
        // Link OAuth account to existing local account
        const linkedUser = await this.linkOAuthAccount(
          existingEmailUser,
          userData
        );
        return linkedUser;
      }

      // Create new OAuth user
      const newUser = await this._createNewOAuthUser(userData);
      return newUser;
    } catch (error) {
      console.error("OAuth user creation error:", error);
      throw error;
    }
  }

  async findUserByProvider(
    provider: "google",
    providerId: string
  ): Promise<IUser | null> {
    return await userRepository.findOne({
      provider,
      providerId,
    });
  }

  async findUserByEmailAndProvider(
    email: string,
    provider: "google" | "local"
  ): Promise<IUser | null> {
    return await userRepository.findOne({
      email,
      provider,
    });
  }

  async linkOAuthAccount(
    existingUser: IUser,
    oauthData: CreateOAuthUserData
  ): Promise<IUser> {
    try {
      existingUser.provider = oauthData.provider;
      existingUser.providerId = oauthData.providerId;
      existingUser.avatar = oauthData.avatar || existingUser.avatar || "";

      await userRepository.updateById(existingUser._id as string, {
        provider: oauthData.provider,
        providerId: oauthData.providerId,
        avatar: oauthData.avatar || existingUser.avatar || "",
      });

      return existingUser;
    } catch (error) {
      console.error("OAuth account linking error:", error);
      throw error;
    }
  }

  async getOAuthUserStatus(userId: string): Promise<{
    isOAuthUser: boolean;
    provider: string;
    hasPassword: boolean;
    avatar?: string;
  }> {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      return {
        isOAuthUser: user.provider !== "local" && !!user.provider,
        provider: user.provider || "local",
        hasPassword: !!user.passwordHash,
        avatar: user.avatar,
      };
    } catch (error) {
      console.error("OAuth status check error:", error);
      throw error;
    }
  }

  private async _createNewOAuthUser(
    userData: CreateOAuthUserData
  ): Promise<IUser> {
    const identityNumber = `OAUTH_${
      userData.provider
    }_${Date.now()}_${randomUUID().slice(0, 8)}`;

    const newUserData = {
      email: userData.email,
      fullName: userData.fullName,
      identityNumber,
      provider: userData.provider,
      providerId: userData.providerId,
      avatar: userData.avatar ?? "" ,
      role: ["USER"],
    };

    return await userService.createUser(newUserData);
  }
}
