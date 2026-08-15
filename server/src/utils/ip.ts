type IpContext = {
  ip: string;
  headers: Record<string, string | string[] | undefined>;
};

/**
 * 将逗号 / 空白分隔的 IP 链路拆成去重列表。
 *
 * @example
 * splitIpChain("1.2.3.4, 10.0.0.1"); // ["1.2.3.4", "10.0.0.1"]
 */
export const splitIpChain = (value: string) => {
  return [
    ...new Set(
      value
        .split(",")
        .flatMap(part => part.trim().split(/\s+/))
        .map(item => item.trim())
        .filter(Boolean)
    ),
  ];
};

/**
 * 获取完整 IP 链路：只取 X-Forwarded-For 中的每一跳。
 * 没有该头时（例如本地直连调试）才回退到直连 IP。
 *
 * @example
 * const chain = getClientIpChain(ctx);
 */
export const getClientIpChain = (ctx: IpContext) => {
  const forwarded = ctx.headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwarded) ? forwarded.filter(Boolean).join(",") : forwarded;
  if (typeof forwardedValue === "string" && forwardedValue.trim()) {
    const chain = splitIpChain(forwardedValue);
    if (chain.length) {
      return chain;
    }
  }
  if (ctx.ip) {
    const fallback = splitIpChain(ctx.ip);
    if (fallback.length) {
      return fallback;
    }
  }
  return ["unknown"];
};

/**
 * 获取客户端真实 IP（链路中的第一跳）。
 *
 * @example
 * const ip = getClientIp(ctx);
 */
export const getClientIp = (ctx: IpContext) => {
  return getClientIpChain(ctx)[0] || "unknown";
};
