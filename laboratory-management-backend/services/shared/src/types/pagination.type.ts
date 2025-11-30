export interface PaginationQuery {
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginationOptions {
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  searchField?: string;
  cursor?: any;
  filters?: Record<string, any>;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
    totalCount?: number;
    limit: number;
  };
}