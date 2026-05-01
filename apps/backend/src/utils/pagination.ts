export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  [key: string]: any;
}

export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

export interface ParsedPagination {
  page: number;
  limit: number;
  offset: number;
}

export const parsePagination = (
  query: PaginationQuery = {},
  options: PaginationOptions = {}
): ParsedPagination => {
  const { defaultLimit = 20, maxLimit = 100 } = options;
  const rawPage = parseInt(String(query.page), 10);
  const rawLimit = parseInt(String(query.limit), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  let limit = defaultLimit;
  if (Number.isFinite(rawLimit) && rawLimit > 0) {
    limit = Math.min(rawLimit, maxLimit);
  }

  const offset = (page - 1) * limit;
  return { page, limit, offset };
};
