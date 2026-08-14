/**
 * 获取客户端真实 IP（兼容代理场景）。
 *
 * @example
 * const ip = getClientIp(ctx);
 */
export const getClientIp = (ctx: {
  ip: string;
  headers: Record<string, string | string[] | undefined>;
}) => {
  const forwarded = ctx.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0].trim();
  }
  return ctx.ip || "unknown";
};
