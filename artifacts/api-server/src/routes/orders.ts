import { Router, type IRouter, type Request } from "express";
import { db, ordersTable, productsTable, orderStatusEnum } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
const VALID_STATUSES: readonly OrderStatus[] = orderStatusEnum.enumValues;

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
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      productName: productsTable.nameEn,
    })
    .from(ordersTable)
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .orderBy(desc(ordersTable.createdAt));
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

// PATCH /orders/:id/status — admin only
router.patch("/orders/:id/status", requireAdmin, async (req: Request<{ id: string }>, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
    return;
  }
  const status: OrderStatus = parsed.data.status as OrderStatus;

  const [updated] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const [row] = await db
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
    .where(eq(ordersTable.id, id))
    .limit(1);

  res.json(row);
});

export default router;
