import type { Model } from "mongoose";
import { PaginationOptions } from "../../../iam-service/src/types/pagination.type.js";
import type { INotification } from "../db/models/notification.model.js";

export interface INotificationRepository {
  findById(id: string, fields?: string): Promise<INotification | null>;
  findByUserId(userId: string): Promise<INotification[]>;
  findByType(type: string): Promise<INotification[]>;
  findByIsRead(userId: string, isRead: boolean): Promise<INotification[]>;

  create(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<INotification>;
  createMany(data: {
    userId: string[];
    type: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<INotification[]>;
  markAsRead(id: string): Promise<INotification | null>;
  deleteById(id: string): Promise<INotification | null>;
  findWithPagination(options: PaginationOptions): Promise<{
    data: INotification[];
    hasNextPage: boolean;
    totalCount?: number;
  }>;
}

export class NotificationRepository implements INotificationRepository {
  constructor(private notificationModel: Model<INotification>) {}

  async findById(id: string, fields?: string): Promise<INotification | null> {
    return this.notificationModel.findById(
      id,
      fields || "_id userId type title body data isRead createdAt updatedAt"
    );
  }

  async findByUserId(userId: string): Promise<INotification[]> {
    return this.notificationModel.find({ userId });
  }

  async findByType(type: string): Promise<INotification[]> {
    return this.notificationModel.find({ type });
  }

  async findByIsRead(userId: string, isRead: boolean): Promise<INotification[]> {
    return this.notificationModel.find({ userId, isRead });
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<INotification> {
    const notification = new this.notificationModel(data);
    return notification.save();
  }

  async createMany(data: {
    userId: string[];
    type: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<INotification[]> {
    const rawUserIds = (data as any).userId;

    const userIds = Array.isArray(rawUserIds)
      ? rawUserIds
      : typeof rawUserIds === "string" && rawUserIds.length > 0
      ? [rawUserIds]
      : [];

    if (userIds.length === 0) {
      throw new Error(
        "NotificationRepository.createMany: 'userId' must be a non-empty array or string",
      );
    }

    const docs = userIds.map((userId) => ({
      userId,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data,
    }));

    return this.notificationModel.insertMany(docs) as unknown as INotification[];
  }

  async markAsRead(id: string): Promise<INotification | null> {
    return this.notificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }

  async deleteById(id: string): Promise<INotification | null> {
    return this.notificationModel.findByIdAndDelete(id);
  }

  async findWithPagination(
    options: PaginationOptions
  ): Promise<{ data: INotification[]; hasNextPage: boolean; totalCount?: number }> {
    const { limit, sortBy, sortOrder, cursor, filters, search, searchField } =
      options;
    const query: Record<string, any> = { ...(filters || {}) };
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortField = sortBy || "createdAt";
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortDirection };

    if (search && searchField) {
      if (searchField === "createdAt") {
        const dateSearch = new Date(search);
        if (!isNaN(dateSearch.getTime())) {
          const dateStart = new Date(dateSearch);
          dateStart.setHours(0, 0, 0, 0);

          const dateEnd = new Date(dateSearch);
          dateEnd.setHours(23, 59, 59, 999);

          query.createdAt = {
            $gte: dateStart,
            $lte: dateEnd,
          };
        }
      } else {
        query.$or = [searchField].map((field) => ({
          [field]: { $regex: search, $options: "i" },
        }));
      }
    }

    if (cursor) {
      if (sortDirection === -1) {
        query[sortField] = { $lt: cursor };
      } else {
        query[sortField] = { $gt: cursor };
      }
    }

    const docs = await this.notificationModel
      .find(query)
      .sort(sortObj)
      .collation({ locale: "en", strength: 2 })
      .limit(limit + 1);

    const hasNextPage = docs.length > limit;
    return {
      data: docs.slice(0, limit),
      hasNextPage,
      totalCount: await this.notificationModel.countDocuments(query),
    };
  }
}
