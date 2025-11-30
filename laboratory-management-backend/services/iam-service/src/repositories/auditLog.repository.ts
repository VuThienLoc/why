import { PaginationOptions } from "../types/pagination.type.js";

export interface IAuditLogRepository {
  findById(id: string, fields?: string): Promise<any>;
  findByCode(code: string): Promise<any>;
  findByAction(action: string): Promise<any>;
  findByDate(date: Date): Promise<any>;
  create(logData: any): Promise<any>;
  updateById(id: string, logData: any): Promise<any>;
  deleteById(id: string): Promise<any>;
  findWithPagination(options: PaginationOptions): Promise<{
    data: any[];
    hasNextPage: boolean;
    totalCount?: number;
  }>;
}

// User repository implementation
export class AuditLogRepository implements IAuditLogRepository {
  constructor(private auditLogModel: any) {}

  async findById(id: string, fields?: string): Promise<any> {
    return await this.auditLogModel.findById(
      id,
      fields ||
        "_id eventCode action eventMessage userId userEmail performedAt serviceName"
    );
  }

  async findByCode(code: string): Promise<any> {
    return await this.auditLogModel.findOne({ eventCode: code });
  }

  async findByAction(action: string): Promise<any> {
    return await this.auditLogModel.findOne({ action: action });
  }

  async findByDate(date: Date): Promise<any> {
    return await this.auditLogModel.findOne({ performedAt: date });
  }

  async create(logData: any): Promise<any> {
    const log = new this.auditLogModel(logData);
    return await log.save();
  }

  async updateById(id: string, logData: any): Promise<any> {
    return await this.auditLogModel.findByIdAndUpdate(id, logData, {
      new: true,
    });
  }

  async deleteById(id: string): Promise<any> {
    return await this.auditLogModel.findByIdAndDelete(id);
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
      if (searchField == "performedAt" || searchField == "createdAt") {
        const dateSearch = new Date(search);
        if (!isNaN(dateSearch.getTime())) {
          const dateStart = new Date(dateSearch);
          dateStart.setHours(0, 0, 0, 0);

          const dateEnd = new Date(dateSearch);
          dateEnd.setHours(23, 59, 59, 59);

          query.performedAt = {
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

    const data = await this.auditLogModel
      .find(query)
      .sort(sortObj)
      .collation({ locale: "en", strength: 2 })
      .limit(limit + 1);
    const hasNextPage = data.length > limit;
    return {
      data: data.slice(0, limit),
      hasNextPage,
      totalCount: await this.auditLogModel.countDocuments(query),
    };
  }
}
