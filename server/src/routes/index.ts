import Router from "@koa/router";
import healthRouter from "./health";
import trackRouter from "./track";

const router = new Router();

router.use(healthRouter.routes(), healthRouter.allowedMethods());
router.use(trackRouter.routes(), trackRouter.allowedMethods());

export default router;
