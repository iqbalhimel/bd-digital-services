import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// GET /orders — admin only
router.get("/orders", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: ordersTable.id,
      customerName: ordersTable.customerName,
      phone: ordersTable.phone,
      email: ordersTable.email,
      productId: ordersTable.productId,
      paymentMethod: ordersTable.paymentMethod,
      message: ordersTable.message,
      createdAt: ordersTable.createdAt,
      productName: productsTable.nameEn,
    })
    .from(ordersTable)
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .orderBy(ordersTable.createdAt);
  res.json(rows);
});

// POST /orders — public (anyone can submit an order)
router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = {
    customerName: parsed.data.customerName,
    phone: parsed.data.phone,
    email: parsed.data.email ?? null,
    productId: parsed.data.productId ?? null,
    paymentMethod: parsed.data.paymentMethod,
    message: parsed.data.message ?? null,
  };
  const [order] = await db.insert(ordersTable).values(data).returning();

  let productName: string | null = null;
  if (order.productId) {
    const [product] = await db
      .select({ nameEn: productsTable.nameEn })
      .from(productsTable)
      .where(eq(productsTable.id, order.productId))
      .limit(1);
    productName = product?.nameEn ?? null;
  }

  res.status(201).json({ ...order, productName });
});

export default router;
