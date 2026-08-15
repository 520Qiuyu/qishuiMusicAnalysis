import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type BlacklistItem = {
  ip: string;
  createdAt: string;
};

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BLACKLIST_PATH = resolve(serverRoot, "data/blacklist.json");

/** 内存黑名单，启动时从文件加载 */
const blacklistStore = new Map<string, BlacklistItem>();

const persistBlacklist = () => {
  mkdirSync(dirname(BLACKLIST_PATH), { recursive: true });
  writeFileSync(BLACKLIST_PATH, `${JSON.stringify([...blacklistStore.values()], null, 2)}\n`, "utf8");
};

const loadBlacklist = () => {
  if (!existsSync(BLACKLIST_PATH)) {
    return;
  }

  try {
    const raw = readFileSync(BLACKLIST_PATH, "utf8").trim();
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as unknown;
    const items = Array.isArray(parsed) ? parsed : [];
    for (const item of items) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const ip = "ip" in item && typeof item.ip === "string" ? item.ip.trim() : "";
      if (!ip) {
        continue;
      }
      const createdAt =
        "createdAt" in item && typeof item.createdAt === "string"
          ? item.createdAt
          : new Date().toISOString();
      blacklistStore.set(ip, { ip, createdAt });
    }
  } catch (error) {
    console.error("[blacklist] 读取黑名单文件失败", error);
  }
};

loadBlacklist();

/**
 * 判断 IP 或整条 IP 链路是否命中黑名单。
 * 规则支持不完整片段，按包含关系匹配（忽略大小写）。
 * 例如规则 "172.2" 会命中 "172.2.15.1"。
 *
 * @example
 * if (isBlacklisted(clientIp)) return;
 * if (isBlacklisted(ipChain)) return;
 */
export const isBlacklisted = (ipOrChain: string | string[]) => {
  const targets = (Array.isArray(ipOrChain) ? ipOrChain : [ipOrChain])
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
  if (!targets.length) {
    return false;
  }
  for (const rule of blacklistStore.keys()) {
    const pattern = rule.trim().toLowerCase();
    if (!pattern) {
      continue;
    }
    if (targets.some(target => target.includes(pattern))) {
      return true;
    }
  }
  return false;
};

/**
 * 获取全部黑名单记录。
 *
 * @example
 * const list = getBlacklist();
 */
export const getBlacklist = () => {
  return [...blacklistStore.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

/**
 * 将 IP 写入内存黑名单（不落盘）。
 */
const upsertBlacklistItem = (ip: string) => {
  const normalizedIp = ip.trim();
  const existed = blacklistStore.get(normalizedIp);
  if (existed) {
    return { item: existed, created: false };
  }
  const item: BlacklistItem = {
    ip: normalizedIp,
    createdAt: new Date().toISOString(),
  };
  blacklistStore.set(normalizedIp, item);
  return { item, created: true };
};

/**
 * 将 IP 加入黑名单并持久化。
 *
 * @example
 * addToBlacklist("1.2.3.4");
 */
export const addToBlacklist = (ip: string) => {
  const result = upsertBlacklistItem(ip);
  persistBlacklist();
  return result;
};

/**
 * 批量将 IP 加入黑名单，只持久化一次。
 *
 * @example
 * addManyToBlacklist(["1.2.3.4", "5.6.7.8"]);
 */
export const addManyToBlacklist = (ips: string[]) => {
  const unique = [...new Set(ips.map(item => item.trim()).filter(Boolean))];
  const data = unique.map(upsertBlacklistItem);
  if (data.some(item => item.created)) {
    persistBlacklist();
  }
  return {
    data,
    createdCount: data.filter(item => item.created).length,
    existedCount: data.filter(item => !item.created).length,
  };
};

/**
 * 将 IP 移出黑名单并持久化。
 *
 * @example
 * removeFromBlacklist("1.2.3.4");
 */
export const removeFromBlacklist = (ip: string) => {
  const normalizedIp = ip.trim();
  const existed = blacklistStore.get(normalizedIp);
  if (!existed) {
    return { removed: false };
  }
  blacklistStore.delete(normalizedIp);
  persistBlacklist();
  return { removed: true, item: existed };
};
