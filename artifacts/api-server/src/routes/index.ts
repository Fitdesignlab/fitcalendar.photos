import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { createAuthRouter } from "./auth";
import photosRouter from "./photos";
import { createEventPhotosRouter } from "./event-photos";

const router: IRouter = Router();

router.use(healthRouter);
router.use(createAuthRouter());
router.use(photosRouter);
router.use(createEventPhotosRouter());

export default router;
