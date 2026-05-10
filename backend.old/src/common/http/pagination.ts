export type PaginationQuery = {
  page: number;
  limit: number;
  skip: number;
  search?: string;
};

export function parsePaginationQuery(input: {
  page?: string | string[];
  limit?: string | string[];
  q?: string | string[];
}): PaginationQuery {
  const page = Math.max(1, Number(input.page ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(input.limit ?? 20) || 20));
  const rawSearch = Array.isArray(input.q) ? input.q[0] : input.q;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    search: rawSearch?.trim() || undefined
  };
}

export function buildPageMeta(input: {
  page: number;
  limit: number;
  total: number;
}) {
  return {
    page: input.page,
    limit: input.limit,
    total: input.total,
    totalPages: Math.max(1, Math.ceil(input.total / input.limit))
  };
}
