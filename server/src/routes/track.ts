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
  appendParseLog,
  cleanupRateLimitStore,
  getClientIp,
  getClientIpChain,
  isBlacklisted,
  isWithinRateLimit,
  markRateLimit,
  recordAndGetIpStats,
  type ParseLogInput,
} from "../utils";

const router = new Router({ prefix: "/api/track" });

/** 按 IP 记录上次请求时间 */
const ipLastRequestAt = new Map<string, number>();
/** 按 trackId 记录上次请求时间 */
const trackIdLastRequestAt = new Map<string, number>();
/** 按 IP 缓存上一次成功解析的 url / playAuth / playAuthID */
const ipLastParseAuth = new Map<string, { url?: string; playAuth?: string; playAuthID?: string }>();
let lastUrl = "";
let lastPlayAuth = "";
let lastPlayAuthID = "";

const buildFakeTrackResponse = (clientIp: string) => {
  const { title, artist, album } = getRandomTrackMeta();
  const lastParse = ipLastParseAuth.get(clientIp);
  return {
    ok: true,
    data: {
      title,
      artist,
      album,
      cover: getRandomImage(),
      // 优先返回该 IP 上一次解析的地址与鉴权信息
      url: lastUrl || getRandomSong(),
      playAuth: lastPlayAuth || lastParse?.playAuth || getRandomPlayAuth(),
      playAuthID: lastPlayAuthID || lastParse?.playAuthID || getRandomPlayAuthID(),
    },
  };
};

const recordTrackLog = (payload: ParseLogInput, level: "log" | "error" = "log") => {
  appendParseLog(payload);
  if (level === "error") {
    console.error("[track/v2]", payload);
    return;
  }
  console.log("[track/v2]", payload);
};

router.post("/v2", async ctx => {
  const body = (ctx.request.body || {}) as Record<string, unknown>;
  const { track_id: trackId, ...rest } = body;
  const startedAt = Date.now();
  const requestTime = new Date().toISOString();
  const ipChain = getClientIpChain(ctx);
  const clientIp = getClientIp(ctx);
  const { ipWindowCount, ipTotalCount } = recordAndGetIpStats(clientIp);
  const blacklisted = isBlacklisted(ipChain);
  const ip = ipChain.join(", ");

  if (!trackId) {
    const response = {
      ok: false,
      message: "track_id 不能为空",
    };
    ctx.status = 400;
    ctx.body = response;
    recordTrackLog({
      time: requestTime,
      ip,
      ips: ipChain,
      /** 该 IP 限制时间内请求数量 */
      ipWindowCount,
      /** 该 IP 总请求数量 */
      ipTotalCount,
      durationMs: Date.now() - startedAt,
      status: 400,
      blacklisted,
      params: body,
      response,
    });
    return;
  }

  const trackIdKey = String(trackId);
  cleanupRateLimitStore(ipLastRequestAt);
  cleanupRateLimitStore(trackIdLastRequestAt);

  const rateLimited =
    isWithinRateLimit(ipLastRequestAt, clientIp) ||
    isWithinRateLimit(trackIdLastRequestAt, trackIdKey);

  // 黑名单或同一 IP / trackId 在间隔内仅允许一次，超出返回假数据
  if (blacklisted || rateLimited) {
    const response = buildFakeTrackResponse(clientIp);
    ctx.body = response;
    recordTrackLog({
      time: requestTime,
      ip,
      ips: ipChain,
      /** 该 IP 限制时间内请求数量 */
      ipWindowCount,
      /** 该 IP 总请求数量 */
      ipTotalCount,
      durationMs: Date.now() - startedAt,
      status: 200,
      rateLimited,
      blacklisted,
      params: body,
      response,
    });
    return;
  }

  markRateLimit(ipLastRequestAt, clientIp);
  markRateLimit(trackIdLastRequestAt, trackIdKey);

  try {
    const data = await fetchTrackV2({}, { track_id: trackId, ...rest });
    ipLastParseAuth.set(clientIp, {
      url: data.url,
      playAuth: data.playAuth,
      playAuthID: data.playAuthID,
    });
    lastUrl = data.url!;
    lastPlayAuth = data.playAuth!;
    lastPlayAuthID = data.playAuthID!;
    const response = {
      ok: true,
      data,
    };
    ctx.body = response;
    recordTrackLog({
      time: requestTime,
      ip,
      ips: ipChain,
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
    recordTrackLog(
      {
        time: requestTime,
        ip,
        ips: ipChain,
        /** 该 IP 限制时间内请求数量 */
        ipWindowCount,
        /** 该 IP 总请求数量 */
        ipTotalCount,
        durationMs: Date.now() - startedAt,
        status: 500,
        params: body,
        response,
        error: error instanceof Error ? error.stack || error.message : error,
      },
      "error"
    );
  }
});

export default router;
