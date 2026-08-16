import Router from "@koa/router";
import { getParseLogs, paginate, parsePageQuery, requireAdminToken } from "../utils";

const router = new Router({ prefix: "/api/logs" });

router.use(requireAdminToken);

router.get("/", async ctx => {
  const ip = typeof ctx.query.ip === "string" ? ctx.query.ip : "";
  const { page, pageSize } = parsePageQuery(ctx.query);
  const logs = getParseLogs({ ip });
  const result = paginate(logs, page, pageSize);
  ctx.body = {
    ok: true,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    pageCount: result.pageCount,
    stats: {
      rateLimited: logs.filter(item => item.rateLimited).length,
      blacklisted: logs.filter(item => item.blacklisted).length,
      failed: logs.filter(item => item.status >= 400).length,
    },
    data: result.data,
  };
});

export default router;
