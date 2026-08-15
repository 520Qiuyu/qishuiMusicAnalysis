import Router from "@koa/router";
import { getParseLogs, requireAdminToken } from "../utils";

const router = new Router({ prefix: "/api/logs" });

router.use(requireAdminToken);

router.get("/", async ctx => {
  const ip = typeof ctx.query.ip === "string" ? ctx.query.ip : "";
  const data = getParseLogs({ ip });
  ctx.body = {
    ok: true,
    total: data.length,
    data,
  };
});

export default router;
