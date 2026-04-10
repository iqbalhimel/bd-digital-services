import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import ordersRouter from "./orders";
import settingsRouter from "./settings";
import noticesRouter from "./notices";
import adminRouter from "./admin";
import statsRouter from "./stats";
import adminWritesRouter from "./admin-writes";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// Public read-only routes
router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(settingsRouter);
router.use(noticesRouter);

// Admin authentication endpoint (public — needed to obtain token)
router.use(adminRouter);

// Orders: GET is admin-only, POST is public — handled inside the router
router.use(ordersRouter);

// Admin-only read routes
router.use(requireAdmin, statsRouter);

// Admin-only mutations (auth enforced inside the router)
router.use(adminWritesRouter);

export default router;
