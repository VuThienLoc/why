import UserModel from "../db/models/User.model.js";
import AuditLog from "../db/models/AuditLog.model.js";
import PasswordHistory from "../db/models/PasswordHistory.model.js";

import { UserRepository } from "./user.repository.js";
import { AuditLogRepository } from "./auditLog.repository.js";
import { PasswordHistoryRepository } from "./passwordHistory.repository.js";

import Role from "../db/models/Role.model.js";
import { RoleRepository } from "./role.repository.js";


// Repository factory
export class RepositoryFactory {
  private static userRepository: UserRepository;

  private static auditLogRepository: AuditLogRepository;
  private static passwordHistoryRepository: PasswordHistoryRepository;

  private static roleRepository: RoleRepository;

  static async initializeRepositories(): Promise<void> {
    // Redis is disabled - using mock client, no initialization needed
    console.log('Redis disabled - using mock client');
  }

  static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository(UserModel);
    }
    return this.userRepository;
  }

  static getAuditLogRepository(): AuditLogRepository {
    if (!this.auditLogRepository) {
      this.auditLogRepository = new AuditLogRepository(AuditLog);
    }
    return this.auditLogRepository;
  }

  static getPasswordHistoryRepository(): PasswordHistoryRepository {
    if (!this.passwordHistoryRepository) {
      this.passwordHistoryRepository = new PasswordHistoryRepository(PasswordHistory);
    }
    return this.passwordHistoryRepository;
  }

  static getRoleRepository(): RoleRepository {
    if (!this.roleRepository) {
      this.roleRepository = new RoleRepository(Role);
    }
    return this.roleRepository;
  }
}

// Export individual repositories for convenience
export const userRepository = RepositoryFactory.getUserRepository();
export const auditLogRepository = RepositoryFactory.getAuditLogRepository();
export const passwordHistoryRepository = RepositoryFactory.getPasswordHistoryRepository();
export const roleRepository = RepositoryFactory.getRoleRepository();
