import Router from "@koa/router";
import {
  getRandomImage,
  getRandomPlayAuth,
  getRandomPlayAuthID,
  getRandomSong,
  getRandomTrackMeta,
} from "../constants";
import { fetchTrackV2 } from "../services/trackV2";
import {
  cleanupRateLimitStore,
  getClientIp,
  isWithinRateLimit,
  markRateLimit,
  recordAndGetIpStats,
} from "../utils";

const router = new Router({ prefix: "/api/track" });

/** 按 IP 记录上次请求时间 */
const ipLastRequestAt = new Map<string, number>();
/** 按 trackId 记录上次请求时间 */
const trackIdLastRequestAt = new Map<string, number>();

router.post("/v2", async ctx => {
  const body = (ctx.request.body || {}) as Record<string, unknown>;
  const { track_id: trackId, ...rest } = body;
  const startedAt = Date.now();
  const requestTime = new Date().toISOString();
  const clientIp = getClientIp(ctx);
  const { ipWindowCount, ipTotalCount } = recordAndGetIpStats(clientIp);

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
      /** 该 IP 限制时间内请求数量 */
      ipWindowCount,
      /** 该 IP 总请求数量 */
      ipTotalCount,
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

  // 同一 IP 或同一 trackId 在间隔内仅允许一次，超出返回空数据
  if (
    isWithinRateLimit(ipLastRequestAt, clientIp) ||
    isWithinRateLimit(trackIdLastRequestAt, trackIdKey)
  ) {
    const { title, artist, album } = getRandomTrackMeta();
    const response = {
      ok: true,
      data: {
        title,
        artist,
        album,
        cover: getRandomImage(),
        url: getRandomSong(),
        playAuth: getRandomPlayAuth(),
        playAuthID: getRandomPlayAuthID(),
      },
    };
    ctx.body = response;
    console.log("[track/v2]", {
      time: requestTime,
      ip: clientIp,
      /** 该 IP 限制时间内请求数量 */
      ipWindowCount,
      /** 该 IP 总请求数量 */
      ipTotalCount,
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
      /** 该 IP 限制时间内请求数量 */
      ipWindowCount,
      /** 该 IP 总请求数量 */
      ipTotalCount,
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
      /** 该 IP 限制时间内请求数量 */
      ipWindowCount,
      /** 该 IP 总请求数量 */
      ipTotalCount,
      durationMs: Date.now() - startedAt,
      status: 500,
      params: body,
      response,
      error: error instanceof Error ? error.stack || error.message : error,
    });
  }
});

export default router;
