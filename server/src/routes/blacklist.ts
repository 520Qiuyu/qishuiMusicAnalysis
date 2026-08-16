import Router from "@koa/router";
import { addManyToBlacklist, getBlacklist, paginate, parsePageQuery, removeFromBlacklist, requireAdminToken } from "../utils";

const router = new Router({ prefix: "/api/blacklist" });

router.use(requireAdminToken);

const getIpFromRequest = (ctx: {
  request: { body?: unknown };
  query: Record<string, unknown>;
}) => {
  const body = (ctx.request.body || {}) as { ip?: unknown };
  if (typeof body.ip === "string" && body.ip.trim()) {
    return body.ip.trim();
  }
  if (typeof ctx.query.ip === "string" && ctx.query.ip.trim()) {
    return ctx.query.ip.trim();
  }
  return "";
};

/**
 * 从请求中收集要操作的 IP 列表，支持 ip 与 ips。
 *
 * @example
 * const ips = getIpsFromRequest(ctx);
 */
const getIpsFromRequest = (ctx: {
  request: { body?: unknown };
  query: Record<string, unknown>;
}) => {
  const body = (ctx.request.body || {}) as { ip?: unknown; ips?: unknown };
  const ips: string[] = [];
  if (typeof body.ip === "string" && body.ip.trim()) {
    ips.push(body.ip.trim());
  }
  if (Array.isArray(body.ips)) {
    for (const item of body.ips) {
      if (typeof item === "string" && item.trim()) {
        ips.push(item.trim());
      }
    }
  }
  const queryIp = getIpFromRequest({ request: { body: {} }, query: ctx.query });
  if (queryIp) {
    ips.push(queryIp);
  }
  return [...new Set(ips)];
};

router.get("/", async ctx => {
  const ip = typeof ctx.query.ip === "string" ? ctx.query.ip : "";
  const { page, pageSize } = parsePageQuery(ctx.query);
  const result = paginate(getBlacklist({ ip }), page, pageSize);
  ctx.body = {
    ok: true,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    pageCount: result.pageCount,
    data: result.data,
  };
});

router.post("/", async ctx => {
  const ips = getIpsFromRequest(ctx);
  if (!ips.length) {
    ctx.status = 400;
    ctx.body = {
      ok: false,
      message: "ip 不能为空",
    };
    return;
  }

  const result = addManyToBlacklist(ips);
  const first = result.data[0];
  ctx.status = result.createdCount ? 201 : 200;
  ctx.body = {
    ok: true,
    created: Boolean(first?.created),
    createdCount: result.createdCount,
    existedCount: result.existedCount,
    data: ips.length === 1 ? first?.item : result.data.map(item => item.item),
  };
});

router.delete("/", async ctx => {
  const ip = getIpFromRequest(ctx);
  if (!ip) {
    ctx.status = 400;
    ctx.body = {
      ok: false,
      message: "ip 不能为空",
    };
    return;
  }

  const result = removeFromBlacklist(ip);
  if (!result.removed) {
    ctx.status = 404;
    ctx.body = {
      ok: false,
      message: "该 IP 不在黑名单中",
    };
    return;
  }

  ctx.body = {
    ok: true,
    data: result.item,
  };
});

export default router;
