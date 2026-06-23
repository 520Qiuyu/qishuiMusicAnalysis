import Router from "@koa/router";

const router = new Router({ prefix: "/health" });

router.get("/", async ctx => {
  ctx.body = { ok: true };
});

export default router;
