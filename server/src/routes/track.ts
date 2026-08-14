import Router from "@koa/router";
import { fetchTrackV2 } from "../services/trackV2";

const router = new Router({ prefix: "/api/track" });

/** 同一 IP / trackId 最小请求间隔（毫秒） */
const RATE_LIMIT_INTERVAL_MS = 3000;

/** 按 IP 记录上次请求时间 */
const ipLastRequestAt = new Map<string, number>();
/** 按 trackId 记录上次请求时间 */
const trackIdLastRequestAt = new Map<string, number>();

/**
 * 获取客户端真实 IP（兼容代理场景）。
 *
 * @example
 * const ip = getClientIp(ctx);
 */
const getClientIp = (ctx: { ip: string; headers: Record<string, string | string[] | undefined> }) => {
  const forwarded = ctx.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0].trim();
  }
  return ctx.ip || "unknown";
};

/**
 * 判断指定 key 是否仍在限流窗口内（不写入时间戳）。
 *
 * @example
 * if (isWithinRateLimit(ipLastRequestAt, clientIp)) return;
 */
const isWithinRateLimit = (store: Map<string, number>, key: string) => {
  const lastAt = store.get(key) ?? 0;
  return Date.now() - lastAt < RATE_LIMIT_INTERVAL_MS;
};

/**
 * 记录指定 key 的本次请求时间。
 *
 * @example
 * markRateLimit(ipLastRequestAt, clientIp);
 */
const markRateLimit = (store: Map<string, number>, key: string) => {
  store.set(key, Date.now());
};

/**
 * 清理过期的限流记录，避免 Map 无限增长。
 */
const cleanupRateLimitStore = (store: Map<string, number>) => {
  const now = Date.now();
  for (const [key, lastAt] of store) {
    if (now - lastAt >= RATE_LIMIT_INTERVAL_MS * 10) {
      store.delete(key);
    }
  }
};

router.post("/v2", async ctx => {
  const body = (ctx.request.body || {}) as Record<string, unknown>;
  const { track_id: trackId, ...rest } = body;
  const startedAt = Date.now();
  const requestTime = new Date().toISOString();
  const clientIp = getClientIp(ctx);

  if (!trackId) {
    const response = {
      ok: false,
      message: "track_id 不能为空",
    };
    ctx.status = 400;
    ctx.body = response;
    console.log("[track/v2]", {
      time: requestTime,
      ip: clientIp,
      durationMs: Date.now() - startedAt,
      status: 400,
      params: body,
      response,
    });
    return;
  }

  const trackIdKey = String(trackId);
  cleanupRateLimitStore(ipLastRequestAt);
  cleanupRateLimitStore(trackIdLastRequestAt);

  // 同一 IP 或同一 trackId 每秒仅允许一次，超出返回空数据
  if (
    isWithinRateLimit(ipLastRequestAt, clientIp) ||
    isWithinRateLimit(trackIdLastRequestAt, trackIdKey)
  ) {
    const response = {
      ok: true,
      data: {
        title: "等你下雨",
        artist: "周杰伦",
        album: "等你下课",
        cover: "https://cdn.truefilesize.com/test/test-500mb.bin",
        url: "https://cdn.truefilesize.com/test/test-500mb.bin",
        playAuth: "91pronhub.com",
        playAuthID: "mantou123",
      },
    };
    ctx.body = response;
    console.log("[track/v2]", {
      time: requestTime,
      ip: clientIp,
      durationMs: Date.now() - startedAt,
      status: 200,
      rateLimited: true,
      params: body,
      response,
    });
    return;
  }

  markRateLimit(ipLastRequestAt, clientIp);
  markRateLimit(trackIdLastRequestAt, trackIdKey);

  try {
    const data = await fetchTrackV2({}, { track_id: trackId, ...rest });
    const response = {
      ok: true,
      data,
    };
    ctx.body = response;
    console.log("[track/v2]", {
      time: requestTime,
      ip: clientIp,
      durationMs: Date.now() - startedAt,
      status: 200,
      params: body,
      response,
    });
  } catch (error) {
    const response = {
      ok: false,
      message: error instanceof Error ? error.message : "获取完整版音频失败",
    };
    ctx.status = 500;
    ctx.body = response;
    console.error("[track/v2]", {
      time: requestTime,
      ip: clientIp,
      durationMs: Date.now() - startedAt,
      status: 500,
      params: body,
      response,
      error: error instanceof Error ? error.stack || error.message : error,
    });
  }
});

export default router;
