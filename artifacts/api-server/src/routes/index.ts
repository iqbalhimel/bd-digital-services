import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesReadRouter from "./categories";
import productsReadRouter from "./products";
import ordersRouter from "./orders";
import settingsReadRouter from "./settings";
import noticesReadRouter from "./notices";
import adminRouter from "./admin";
import statsRouter from "./stats";
import adminWritesRouter from "./admin-writes";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// Public read-only routes
router.use(healthRouter);
router.use(categoriesReadRouter);
router.use(productsReadRouter);
router.use(settingsReadRouter);
router.use(noticesReadRouter);

// Admin authentication endpoint (public)
router.use(adminRouter);

// Admin-only routes (require valid token)
router.use(requireAdmin, ordersRouter);
router.use(requireAdmin, statsRouter);
router.use(adminWritesRouter); // Auth is applied inside the router itself

export default router;
