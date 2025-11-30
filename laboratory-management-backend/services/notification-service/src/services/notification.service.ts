import { notificationRepository } from "../repositories/index.js";
import type { INotification } from "../db/models/notification.model.js";
import {
  PaginationOptions,
  PaginationResponse,
} from "../../../shared/src/types/pagination.type.js";
import { PaginationUtils } from "../../../shared/src/utils/pagination.util.js";
import {
  TYPE_TITLE,
  NotificationTypes,
} from "../constants/notificationType.constant.js";

export class NotificationService {
  async getNotificationId(notifyId: string): Promise<INotification | null> {
    return notificationRepository.findById(notifyId);
  }

  async listNotifs(
    options: PaginationOptions,
    extraFilters: Record<string, any> = {}
  ): Promise<PaginationResponse<INotification>> {
    options.filters = {
      ...(options.filters || {}),
      ...extraFilters,
    };
    const result = await notificationRepository.findWithPagination(options);
    return PaginationUtils.formatResponse(
      result.data,
      result.hasNextPage,
      options,
      result.totalCount
    );
  }

  async notifyUser(
    userId: string,
    type: string,
    body: string,
    data: any
  ): Promise<INotification> {
    const title = TYPE_TITLE[type as NotificationTypes] ?? "New notification";

    return notificationRepository.create({
      userId,
      type,
      title,
      body,
      data,
    });
  }

  async notifyManyUsers(
    userId: string[],
    type: string,
    body: string,
    data: any
  ): Promise<INotification[]> {
    const title = TYPE_TITLE[type as NotificationTypes] ?? "New notification";

    return notificationRepository.createMany({
      userId,
      type,
      title,
      body,
      data,
    });
  }

  async markAsRead(
    notificationId: string,
  ): Promise<INotification> {
    const updatedNotif = await notificationRepository.markAsRead(notificationId);

    if (!updatedNotif) {
      throw new Error("Notification not found");
    }

    return updatedNotif;
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<INotification | null> {
    const notif = await this.getNotificationId(notificationId);
    if (!notif) {
      throw new Error("No notifications are found");
    }
    return notificationRepository.deleteById(notificationId);
  }
}
