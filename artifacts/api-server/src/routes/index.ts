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
import { ordersLimiter, adminLimiter } from "../middlewares/rateLimits";

const router: IRouter = Router();

// Health check — no auth, no rate limit (for uptime monitors)
router.use(healthRouter);

// Public read-only routes
router.use(categoriesRouter);
router.use(productsRouter);
router.use(settingsRouter);
router.use(noticesRouter);

// Admin authentication endpoint — loginLimiter applied inside admin.ts
router.use(adminRouter);

// Orders: GET is admin-only, POST is public — rate-limited per minute
router.use(ordersLimiter, ordersRouter);

// Admin-only read routes
router.use(adminLimiter, requireAdmin, statsRouter);

// Admin-only mutations (auth enforced inside the router)
router.use(adminLimiter, adminWritesRouter);

export default router;
