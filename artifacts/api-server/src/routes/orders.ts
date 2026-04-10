import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

const VALID_STATUSES = ["pending", "processing", "completed", "cancelled"] as const;

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
router.patch("/orders/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const { status } = req.body as { status?: string };
  if (!status || !(VALID_STATUSES as readonly string[]).includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
    return;
  }

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
