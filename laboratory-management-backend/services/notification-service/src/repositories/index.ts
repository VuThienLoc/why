import NotificationModel from "../db/models/notification.model.js";
import { NotificationRepository } from "./notification.repository.js";
// Repository factory
export class RepositoryFactory {
  private static notificationRepository: NotificationRepository;

  static async initializeRepositories(): Promise<void> {
  }

  static getNotificationRepository(): NotificationRepository {
    if (!this.notificationRepository) {
      this.notificationRepository = new NotificationRepository(NotificationModel);
    }
    return this.notificationRepository;
  }
}

// Export individual repositories for convenience
export const notificationRepository = RepositoryFactory.getNotificationRepository();
