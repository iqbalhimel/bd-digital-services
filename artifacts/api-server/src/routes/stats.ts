import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [totalProductsResult] = await db
    .select({ count: count() })
    .from(productsTable);
  const [totalCategoriesResult] = await db
    .select({ count: count() })
    .from(categoriesTable);
  const [totalOrdersResult] = await db
    .select({ count: count() })
    .from(ordersTable);
  const [activeProductsResult] = await db
    .select({ count: count() })
    .from(productsTable)
    .where(eq(productsTable.isActive, true));

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt)
    .limit(5);

  res.json({
    totalProducts: Number(totalProductsResult?.count ?? 0),
    totalCategories: Number(totalCategoriesResult?.count ?? 0),
    totalOrders: Number(totalOrdersResult?.count ?? 0),
    activeProducts: Number(activeProductsResult?.count ?? 0),
    recentOrders: recentOrders.map((o) => ({
      ...o,
      productName: null,
    })),
  });
});

export default router;
