import { env } from "../config/env";

/**
 * 判断指定 key 是否仍在限流窗口内（不写入时间戳）。
 *
 * @example
 * if (isWithinRateLimit(ipLastRequestAt, clientIp)) return;
 */
export const isWithinRateLimit = (
  store: Map<string, number>,
  key: string,
  intervalMs = env.rateLimitIntervalMs
) => {
  const lastAt = store.get(key) ?? 0;
  return Date.now() - lastAt < intervalMs;
};

/**
 * 记录指定 key 的本次请求时间。
 *
 * @example
 * markRateLimit(ipLastRequestAt, clientIp);
 */
export const markRateLimit = (store: Map<string, number>, key: string) => {
  store.set(key, Date.now());
};

/**
 * 清理过期的限流记录，避免 Map 无限增长。
 *
 * @example
 * cleanupRateLimitStore(ipLastRequestAt);
 */
export const cleanupRateLimitStore = (
  store: Map<string, number>,
  intervalMs = env.rateLimitIntervalMs
) => {
  const now = Date.now();
  for (const [key, lastAt] of store) {
    if (now - lastAt >= intervalMs * 10) {
      store.delete(key);
    }
  }
};
