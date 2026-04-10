import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable, ordersTable } from "@workspace/db";
import { count, desc, eq } from "drizzle-orm";

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
    .select({
      id: ordersTable.id,
      customerName: ordersTable.customerName,
      phone: ordersTable.phone,
      email: ordersTable.email,
      productId: ordersTable.productId,
      paymentMethod: ordersTable.paymentMethod,
      message: ordersTable.message,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      productName: productsTable.nameEn,
    })
    .from(ordersTable)
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .orderBy(desc(ordersTable.createdAt))
    .limit(5);

  res.json({
    totalProducts: Number(totalProductsResult?.count ?? 0),
    totalCategories: Number(totalCategoriesResult?.count ?? 0),
    totalOrders: Number(totalOrdersResult?.count ?? 0),
    activeProducts: Number(activeProductsResult?.count ?? 0),
    recentOrders,
  });
});

export default router;
