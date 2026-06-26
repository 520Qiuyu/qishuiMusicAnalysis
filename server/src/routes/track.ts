import Router from "@koa/router";
import { fetchTrackV2 } from "../services/trackV2";

const router = new Router({ prefix: "/api/track" });

router.post("/v2", async ctx => {
  const body = (ctx.request.body || {}) as Record<string, unknown>;
  const { track_id: trackId, ...rest } = body;

  if (!trackId) {
    ctx.status = 400;
    ctx.body = {
      ok: false,
      message: "track_id 不能为空",
    };
    return;
  }

  try {
    const data = await fetchTrackV2({}, { track_id: trackId, ...rest });
    ctx.body = {
      ok: true,
      data,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      ok: false,
      message: error instanceof Error ? error.message : "获取完整版音频失败",
    };
  }
});

export default router;
