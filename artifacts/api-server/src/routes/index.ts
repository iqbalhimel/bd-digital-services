import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import ordersRouter from "./orders";
import settingsRouter from "./settings";
import noticesRouter from "./notices";
import adminRouter from "./admin";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(settingsRouter);
router.use(noticesRouter);
router.use(adminRouter);
router.use(statsRouter);

export default router;
