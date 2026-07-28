import Router from "@koa/router";
import { fetchTrackV2 } from "../services/trackV2";

const router = new Router({ prefix: "/api/track" });

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
