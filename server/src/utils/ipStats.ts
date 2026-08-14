import { env } from "../config/env";

/** 按 IP 记录窗口内请求时间戳 */
const ipWindowTimestamps = new Map<string, number[]>();
/** 按 IP 记录总请求次数 */
const ipTotalCounts = new Map<string, number>();

/**
 * 记录一次 IP 请求，并返回窗口内次数与总次数。
 *
 * @example
 * const { ipWindowCount, ipTotalCount } = recordAndGetIpStats(clientIp);
 */
export const recordAndGetIpStats = (
  ip: string,
  intervalMs = env.rateLimitIntervalMs
) => {
  const now = Date.now();
  const prevTimestamps = ipWindowTimestamps.get(ip) ?? [];
  const inWindowTimestamps = prevTimestamps.filter(timestamp => now - timestamp < intervalMs);
  inWindowTimestamps.push(now);
  ipWindowTimestamps.set(ip, inWindowTimestamps);

  const ipTotalCount = (ipTotalCounts.get(ip) ?? 0) + 1;
  ipTotalCounts.set(ip, ipTotalCount);

  return {
    /** 该 IP 在限制时间内的请求数量（含本次） */
    ipWindowCount: inWindowTimestamps.length,
    /** 该 IP 总请求数量（含本次） */
    ipTotalCount,
  };
};
