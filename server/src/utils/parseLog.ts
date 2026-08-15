/** 解析日志仅保留 24 小时 */
const PARSE_LOG_TTL_MS = 24 * 60 * 60 * 1000;

export type ParseLogEntry = {
  id: string;
  time: string;
  ip: string;
  /** 完整 IP 链路（X-Forwarded-For 各跳） */
  ips?: string[];
  /** 该 IP 限制时间内请求数量 */
  ipWindowCount: number;
  /** 该 IP 总请求数量 */
  ipTotalCount: number;
  durationMs: number;
  status: number;
  rateLimited?: boolean;
  blacklisted?: boolean;
  params: Record<string, unknown>;
  response: unknown;
  error?: unknown;
};

export type ParseLogInput = Omit<ParseLogEntry, "id">;

/** 按 id 存储解析日志 */
const parseLogStore = new Map<string, ParseLogEntry>();

let logSeq = 0;

const getEntryTimestamp = (entry: ParseLogEntry) => {
  const timestamp = Date.parse(entry.time);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

/**
 * 清理超过 24 小时的解析日志。
 *
 * @example
 * cleanupParseLogs();
 */
export const cleanupParseLogs = () => {
  const expireBefore = Date.now() - PARSE_LOG_TTL_MS;
  for (const [id, entry] of parseLogStore) {
    if (getEntryTimestamp(entry) < expireBefore) {
      parseLogStore.delete(id);
    }
  }
};

/**
 * 追加一条解析日志，并自动剔除 24 小时外的记录。
 *
 * @example
 * appendParseLog({ time, ip, ips, ipWindowCount, ipTotalCount, durationMs, status, params, response });
 */
export const appendParseLog = (input: ParseLogInput) => {
  cleanupParseLogs();
  const id = `${Date.now()}-${++logSeq}`;
  const entry: ParseLogEntry = { id, ...input };
  parseLogStore.set(id, entry);
  return entry;
};

/**
 * 获取 24 小时内的解析日志，默认按时间倒序。
 * ip 为包含匹配（忽略大小写），例如 "171.2" 可筛出 171.2.x.x。
 *
 * @example
 * const logs = getParseLogs();
 * const ipLogs = getParseLogs({ ip: "171.2" });
 */
export const getParseLogs = (filter?: { ip?: string }) => {
  cleanupParseLogs();
  const ip = filter?.ip?.trim().toLowerCase();
  const logs = [...parseLogStore.values()].filter(entry => {
    if (!ip) {
      return true;
    }
    if (entry.ip.toLowerCase().includes(ip)) {
      return true;
    }
    return (entry.ips ?? []).some(hop => hop.toLowerCase().includes(ip));
  });
  logs.sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a));
  return logs;
};
