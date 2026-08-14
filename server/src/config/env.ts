import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

dotenv.config({ path: resolve(serverRoot, ".env") });

/**
 * 读取 server/.env 中的配置项。
 *
 * @example
 * import { env } from "../config/env";
 * console.log(env.port);
 */
export const env = {
  port: Number(process.env.PORT) || 3001,
  deviceId: process.env.DEVICE_ID || "",
  cookie: process.env.COOKIE || "",
  xHelios: process.env.X_HELIOS || "",
  xMedusa: process.env.X_MEDUSA || "",
  /** 同一 IP / trackId 最小请求间隔（毫秒），默认 4000 */
  rateLimitIntervalMs: Number(process.env.RATE_LIMIT_INTERVAL_MS) || 4000,
};
