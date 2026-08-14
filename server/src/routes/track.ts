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
        cover: "https://image.baidu.com/search/detail?adpicid=0&b_applid=7753848279465033925&bdtype=0&commodity=&copyright=&cs=2382431198%2C1978442763&di=1&fr=click-pic&fromurl=http%253A%252F%252Fbaike.baidu.com%252Fitem%252F%2525E6%2525AD%2525A6%2525E6%2525AD%2525A6%2525E6%2525AD%2525A6%2525E8%25258F%2525B2%2525E8%25258F%2525B2%2525E8%25258F%2525B2%252F64942939&gsm=1e&hd=&height=0&hot=&ic=&ie=utf-8&imgformat=&imgratio=&imgspn=0&is=0%2C0&isImgSet=&latest=&lid=cb31335701ba1b93&lm=&objurl=https%253A%252F%252Fbkimg.cdn.bcebos.com%252Fpic%252Fa8014c086e061d950a7bb2282cad1dd162d9f2d35cd3&os=1838382929%2C179640454&pd=image_content&pi=0&pn=20&rn=1&simid=4118884631%2C559445484&tn=baiduimagedetail&width=0&word=%E7%8C%AA%E7%8C%AA%E4%BE%A0&z=",
        url: "https://cdn.truefilesize.com/test/test-1gb.bin",
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
