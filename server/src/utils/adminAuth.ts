import { timingSafeEqual } from "node:crypto";
import type { Context, Next } from "koa";
import { env } from "../config/env";

const isSameToken = (input: string, expected: string) => {
  const inputBuf = Buffer.from(input);
  const expectedBuf = Buffer.from(expected);
  if (inputBuf.length !== expectedBuf.length) {
    return false;
  }
  return timingSafeEqual(inputBuf, expectedBuf);
};

/**
 * 从请求头 X-Admin-Token 读取管理口令。
 *
 * @example
 * const token = getRequestAdminToken(ctx);
 */
export const getRequestAdminToken = (ctx: Context) => {
  const headerToken = ctx.headers["x-admin-token"];
  if (typeof headerToken === "string" && headerToken.trim()) {
    return headerToken.trim();
  }
  return "";
};

/**
 * 校验管理口令，未携带或错误时拒绝访问。
 *
 * @example
 * router.use(requireAdminToken);
 */
export const requireAdminToken = async (ctx: Context, next: Next) => {
  if (ctx.method === "OPTIONS") {
    await next();
    return;
  }

  if (!env.adminToken) {
    ctx.status = 401;
    ctx.body = {
      ok: false,
      message: "未配置管理口令",
    };
    return;
  }

  const token = getRequestAdminToken(ctx);
  if (!token || !isSameToken(token, env.adminToken)) {
    ctx.status = 401;
    ctx.body = {
      ok: false,
      message: "口令无效",
    };
    return;
  }

  await next();
};
