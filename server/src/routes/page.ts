import { createReadStream, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Router from "@koa/router";

const htmlPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../index.html");
const router = new Router();

/**
 * 输出管理页 HTML。
 *
 * @example
 * router.get("/", serveIndex);
 */
const serveIndex = async (ctx: { type: string; body: unknown; status: number; set: (field: string, value: string) => void }) => {
  if (!existsSync(htmlPath)) {
    ctx.status = 404;
    ctx.body = { ok: false, message: "管理页不存在" };
    return;
  }

  ctx.type = "html";
  ctx.set("Cache-Control", "no-store");
  ctx.body = createReadStream(htmlPath);
};

router.get("/", serveIndex);
router.get("/index.html", serveIndex);

export default router;
