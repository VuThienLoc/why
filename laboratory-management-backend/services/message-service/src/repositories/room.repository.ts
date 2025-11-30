import type { Model } from "mongoose";
import { PaginationOptions } from "../../../iam-service/src/types/pagination.type.js";
import type { IRoom } from "../db/models/room.model.js";

export interface IRoomRepository {
  findById(id: string, fields?: string): Promise<IRoom | null>;
  findManyByDate(date: Date): Promise<IRoom[]>;
  findByName(name: string): Promise<IRoom[]>;
  create(data: { name?: string; participants: string[] }): Promise<IRoom>;
  joinRoom(roomId: string, userId: string): Promise<IRoom | null>;
  leaveRoom(roomId: string, userId: string): Promise<IRoom | null>;
  updateById(id: string, data: Partial<{ name?: string; participants: string[] }>): Promise<IRoom | null>;
  deleteById(id: string): Promise<IRoom | null>;
  findWithPagination(options: PaginationOptions): Promise<{
    data: IRoom[];
    hasNextPage: boolean;
    totalCount?: number;
  }>;
}

export class RoomRepository implements IRoomRepository {
  constructor(private roomModel: Model<IRoom>) {}

  async findById(id: string, fields?: string): Promise<IRoom | null> {
    return this.roomModel.findById(id, fields || "_id name participants createdAt createdBy updatedAt");
  }

  async findManyByDate(date: Date): Promise<IRoom[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.roomModel.find({ createdAt: { $gte: start, $lte: end } });
  }

  async findByName(name: string): Promise<IRoom[]> {
    return this.roomModel.find({ name });
  }

  async joinRoom(roomId: string, userId: string): Promise<IRoom | null> {
    return this.roomModel.findByIdAndUpdate(roomId, { $push: { participants: userId } }, { new: true });
  }

  async leaveRoom(roomId: string, userId: string): Promise<IRoom | null> {
    return this.roomModel.findByIdAndUpdate(roomId, { $pull: { participants: userId } }, { new: true });
  }

  async create(data: { name?: string; participants: string[]; createdBy: string }): Promise<IRoom> {
    const room = new this.roomModel(data);
    return room.save();
  }

  async updateById(
    id: string,
    data: Partial<{ name?: string; participants: string[] }>
  ): Promise<IRoom | null> {
    return this.roomModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string): Promise<IRoom | null> {
    return this.roomModel.findByIdAndDelete(id);
  }

  async findWithPagination(
    options: PaginationOptions
  ): Promise<{ data: IRoom[]; hasNextPage: boolean; totalCount?: number }> {
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

    const docs = await this.roomModel
      .find(query)
      .sort(sortObj)
      .collation({ locale: "en", strength: 2 })
      .limit(limit + 1);

    const hasNextPage = docs.length > limit;
    return {
      data: docs.slice(0, limit),
      hasNextPage,
      totalCount: await this.roomModel.countDocuments(query),
    };
  }
}
