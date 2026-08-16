export type PageQuery = {
  page: number;
  pageSize: number;
};

/**
 * 从查询参数解析分页，页码从 1 开始。
 *
 * @example
 * const { page, pageSize } = parsePageQuery(ctx.query);
 */
export const parsePageQuery = (
  query: Record<string, unknown>,
  defaultSize = 200,
  maxSize = 500
): PageQuery => {
  const rawPage = Number(query.page);
  const rawSize = Number(query.pageSize);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const pageSize =
    Number.isFinite(rawSize) && rawSize >= 1
      ? Math.min(maxSize, Math.floor(rawSize))
      : defaultSize;
  return { page, pageSize };
};

/**
 * 对已排序列表做切片分页。
 *
 * @example
 * const result = paginate(items, 1, 20);
 */
export const paginate = <T>(items: T[], page: number, pageSize: number) => {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    total,
    page: safePage,
    pageSize,
    pageCount,
    data: items.slice(start, start + pageSize),
  };
};
