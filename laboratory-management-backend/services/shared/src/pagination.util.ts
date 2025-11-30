import { PaginationOptions, PaginationResponse } from '../src/types/pagination.type.js';
export class PaginationUtils {
  static parseQuery(query: any): PaginationOptions {
    const limit = parseInt(query.limit) || 10;

    if (limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    return {
      limit,
      cursor: query.cursor,
      sortBy: query.sortBy || "updatedAt",
      search: query.search,
      searchField: query.searchField,
      sortOrder: query.sortOrder || "desc",
      filters: query.filters,
    };
  }

  static formatResponse<T>(
    data: T[],
    hasNextPage: boolean,
    options: PaginationOptions,
    totalCount?: number
  ): PaginationResponse<T> {
    const sortBy = options.sortBy || "_id";
    const response: PaginationResponse<T> = {
      data,
      pagination: {
        hasNextPage,
        hasPreviousPage: options.cursor !== undefined,
        nextCursor: hasNextPage && data.length > 0
          ? (data[data.length - 1] as any)[sortBy]
          : undefined,
        previousCursor: options.cursor || undefined,
        limit: options.limit,
      },
    };

    if (totalCount !== undefined) {
      response.pagination.totalCount = totalCount;
    }

    return response;
  }
}
