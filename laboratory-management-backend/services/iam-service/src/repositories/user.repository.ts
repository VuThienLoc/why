import { PaginationOptions } from "../types/pagination.type.js";

// User repository interface
export interface IUserRepository {
  findById(id: string, fields?: string): Promise<any>;
  getUserBasicInfo(id: string): Promise<{ email: string; fullName: string } | null>;
  findByEmail(email: string): Promise<any>;
  findByPhoneNumber(identityNumber: string): Promise<any>;
  create(userData: any): Promise<any>;
  updateById(id: string, userData: any): Promise<any>;
  deleteById(id: string): Promise<any>;
  findAll(fields?: string): Promise<any[]>;
  findWithPagination(options: PaginationOptions): Promise<{
    data: any[];
    hasNextPage: boolean;
    totalCount?: number;
  }>;
}

// User repository implementation
export class UserRepository implements IUserRepository {
  constructor(private userModel: any) {}

  async findById(id: string, fields?: string): Promise<any> {
    return await this.userModel.findById(
      id,
      fields ||
        "_id email fullName phoneNumber identityNumber gender age dateOfBirth phoneNumber address isActive isDeleted provider providerId avatar role"
    );
  }

  async getUserBasicInfo(
    id: string
  ): Promise<{ email: string; fullName: string; avatar?: string } | null> {
    return this.userModel.findById(id, "email fullName avatar");
  }

  async findByEmail(email: string): Promise<any> {
    return await this.userModel.findOne({ email });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<any> {
    return await this.userModel.findOne({ phoneNumber });
  }

  async findOne(criteria: any): Promise<any> {
    return await this.userModel.findOne(criteria);
  }

  async create(userData: any): Promise<any> {
    const user = new this.userModel(userData);
    return await user.save();
  }

  async updateById(id: string, userData: any): Promise<any> {
    return await this.userModel.findByIdAndUpdate(id, userData, { new: true });
  }

  async deleteById(id: string): Promise<any> {
    return await this.userModel.findByIdAndDelete(id);
  }

  async findAll(fields?: string): Promise<any[]> {
    return await this.userModel.find({}, fields);
  }

  async searchByFullName(keyword: string, fields?: string, limit: number = 20): Promise<any[]> {
    const regex = new RegExp(keyword, "i");
    return await this.userModel
      .find({ fullName: regex }, fields)
      .limit(limit)
      .lean();
  }

  async findWithPagination(
    options: PaginationOptions
  ): Promise<{ data: any[]; hasNextPage: boolean; totalCount?: number }> {
    const { limit, sortBy, sortOrder, cursor, filters, search, searchField } =
      options;
    const query: any = { ...filters };
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortObj = { [sortBy || "_id"]: sortDirection };

    if (search && searchField) {
      if (searchField == "updatedAt") {
        const dateSearch = new Date(search);
        if (!isNaN(dateSearch.getTime())) {
          const dateStart = new Date(dateSearch);
          dateStart.setHours(0, 0, 0, 0);

          const dateEnd = new Date(dateSearch);
          dateEnd.setHours(23, 59, 59, 59);

          query.updatedAt = {
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
      const cursorField = sortBy || "_id";

      // For proper cursor pagination, we need to find items that come AFTER the cursor
      // in the sort order, not just exclude the cursor item
      if (sortDirection === -1) {
        // Descending order: get items BEFORE cursor in time (but after in pagination)
        // We need items where field < cursor to get the next page
        query[cursorField] = { $lt: cursor };
      } else {
        // Ascending order: get items AFTER cursor in time
        query[cursorField] = { $gt: cursor };
      }
    }

    const data = await this.userModel
      .find(query)
      .sort(sortObj)
      .collation({ locale: "en", strength: 2 })
      .limit(limit + 1);
    const hasNextPage = data.length > limit;
    return {
      data: data.slice(0, limit),
      hasNextPage,
      totalCount: await this.userModel.countDocuments(query),
    };
  }
}
