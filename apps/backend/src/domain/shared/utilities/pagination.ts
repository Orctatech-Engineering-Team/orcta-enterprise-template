export type TransactionRunner = <T>(fn: (tx: unknown) => Promise<T>) => Promise<T>;

export type PaginationParams = {
  page: number;
  limit: number;
  search?: string;
  searchColumns?: string[];
  orderBy?: string;
  orderDir?: "asc" | "desc";
};

export type PaginationResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export function buildPaginationResult<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}
