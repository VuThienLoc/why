import type { Model } from "mongoose";
import { PaginationOptions } from "../../../iam-service/src/types/pagination.type.js";
import type { IMessage } from "../db/models/message.model.js";

export interface IMessageRepository {
  findById(id: string, fields?: string): Promise<IMessage | null>;
  findManyByRoomId(roomId: string): Promise<IMessage[]>;
  findManyByUserId(userId: string): Promise<IMessage[]>;
  findManyByDate(date: Date): Promise<IMessage[]>;
  create(data: Pick<IMessage, "roomId" | "userId" | "text">): Promise<IMessage>;
  updateById(
    roomId: string,
    messageId: string,
    data: Partial<IMessage>
  ): Promise<IMessage | null>;
  deleteById(roomId: string, messageId: string): Promise<IMessage | null>;
  findWithPagination(
    roomId: string,
    options: PaginationOptions
  ): Promise<{
    data: IMessage[];
    hasNextPage: boolean;
    totalCount?: number;
  }>;
}

export class MessageRepository implements IMessageRepository {
  constructor(private messageModel: Model<IMessage>) {}

  async findById(id: string, fields?: string): Promise<IMessage | null> {
    return this.messageModel.findById(
      id,
      fields || "_id roomId userId text createdAt updatedAt"
    );
  }

  async findManyByRoomId(roomId: string): Promise<IMessage[]> {
    return this.messageModel.find({ roomId });
  }

  async findManyByUserId(userId: string): Promise<IMessage[]> {
    return this.messageModel.find({ userId });
  }

  async findManyByDate(date: Date): Promise<IMessage[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.messageModel.find({ createdAt: { $gte: start, $lte: end } });
  }

  async create(
    data: Pick<IMessage, "roomId" | "userId" | "text">
  ): Promise<IMessage> {
    const message = new this.messageModel(data);
    return message.save();
  }

  async updateById(
    roomId: string,
    messageId: string,
    data: Partial<IMessage>
  ): Promise<IMessage | null> {
    return this.messageModel.findOneAndUpdate(
      { _id: messageId, roomId },
      data,
      { new: true }
    );
  }

  async deleteById(
    roomId: string,
    messageId: string
  ): Promise<IMessage | null> {
    return this.messageModel.findOneAndUpdate(
      { _id: messageId, roomId },
      { isDeleted: true, deletedAt: new Date(), text: "" },
      { new: true }
    );
  }

  async findWithPagination(
    roomId: string,
    options: PaginationOptions
  ): Promise<{ data: IMessage[]; hasNextPage: boolean; totalCount?: number }> {
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
      // cursor is assumed to be a value of the sort field (e.g., createdAt or _id)
      if (sortDirection === -1) {
        query[sortField] = { $lt: cursor };
      } else {
        query[sortField] = { $gt: cursor };
      }
    }

    const docs = await this.messageModel
      .find({ roomId, ...query })
      .sort(sortObj)
      .collation({ locale: "en", strength: 2 })
      .limit(limit + 1);

    const hasNextPage = docs.length > limit;
    return {
      data: docs.slice(0, limit),
      hasNextPage,
      totalCount: await this.messageModel.countDocuments(query),
    };
  }
}
