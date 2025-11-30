import { PaginationOptions } from "../types/pagination.type.js";

// Role repository interface
export interface IRoleRepository {
  findById(id: string, fields?: string): Promise<any>;
  findOne(criteria: any): Promise<any>;
  findByPrivileges(privileges: string[]): Promise<any>;
  create(roleData: any): Promise<any>;
  updateById(id: string, roleData: any): Promise<any>;
  deleteById(id: string): Promise<any>;
  findAll(fields?: string): Promise<any[]>;
  findWithPagination(options: PaginationOptions): Promise<{
    data: any[];
    hasNextPage: boolean;
    totalCount?: number;
  }>;
}

// Role repository implementation
export class RoleRepository implements IRoleRepository {
  constructor(private roleModel: any) {}

  async findById(id: string, fields?: string): Promise<any> {
    return await this.roleModel.findById(
      id,
      fields ||
        "_id roleCode roleName description isSystemRole isActive createdBy updatedBy privileges"
    );
  }

  async findOne(criteria: any): Promise<any> {
    return await this.roleModel.findOne(criteria);
  }

  async findByPrivileges(privileges: string[]): Promise<any> {
    return await this.roleModel.find({ privileges: { $in: privileges } });
  }

  async create(roleData: any): Promise<any> {
    const role = new this.roleModel(roleData);
    return await role.save();
  }

  async updateById(id: string, roleData: any): Promise<any> {
    return await this.roleModel.findByIdAndUpdate(id, roleData, { new: true });
  }

  async deleteById(id: string): Promise<any> {
    return await this.roleModel.findByIdAndDelete(id);
  }

  async findAll(fields?: string): Promise<any[]> {
    return await this.roleModel.find({}, fields);
  }

  async findWithPagination(
    options: PaginationOptions
  ): Promise<{ data: any[]; hasNextPage: boolean; totalCount?: number }> {
    const { limit, sortBy, sortOrder, cursor, filters, search, searchField } = options;
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

    const data = await this.roleModel
      .find(query)
      .sort(sortObj)
      .collation({ locale: 'en', strength: 2 })
      .limit(limit + 1);
    const hasNextPage = data.length > limit;
    return {
      data: data.slice(0, limit),
      hasNextPage,
      totalCount: await this.roleModel.countDocuments(query),
    };
  }
}
