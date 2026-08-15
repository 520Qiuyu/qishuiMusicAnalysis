import Router from "@koa/router";
import blacklistRouter from "./blacklist";
import healthRouter from "./health";
import logsRouter from "./logs";
import pageRouter from "./page";
import trackRouter from "./track";

const router = new Router();

router.use(pageRouter.routes(), pageRouter.allowedMethods());
router.use(healthRouter.routes(), healthRouter.allowedMethods());
router.use(trackRouter.routes(), trackRouter.allowedMethods());
router.use(logsRouter.routes(), logsRouter.allowedMethods());
router.use(blacklistRouter.routes(), blacklistRouter.allowedMethods());

export default router;
