import Koa from "koa";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import { env } from "./config/env";
import router from "./routes";

const app = new Koa();
const PORT = env.port;

app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Accept", "Authorization"],
  }),
);
app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
