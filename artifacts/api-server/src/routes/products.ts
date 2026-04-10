import { Router, type IRouter } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import {
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
  GetProductParams,
  ListProductsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getProductWithCategory(id: number) {
  const rows = await db
    .select({
      id: productsTable.id,
      nameBn: productsTable.nameBn,
      nameEn: productsTable.nameEn,
      descriptionBn: productsTable.descriptionBn,
      descriptionEn: productsTable.descriptionEn,
      categoryId: productsTable.categoryId,
      priceBdt: productsTable.priceBdt,
      priceUsd: productsTable.priceUsd,
      badge: productsTable.badge,
      isActive: productsTable.isActive,
      sortOrder: productsTable.sortOrder,
      createdAt: productsTable.createdAt,
      categoryNameEn: categoriesTable.nameEn,
      categoryNameBn: categoriesTable.nameBn,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

router.get("/products/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: productsTable.id,
      nameBn: productsTable.nameBn,
      nameEn: productsTable.nameEn,
      descriptionBn: productsTable.descriptionBn,
      descriptionEn: productsTable.descriptionEn,
      categoryId: productsTable.categoryId,
      priceBdt: productsTable.priceBdt,
      priceUsd: productsTable.priceUsd,
      badge: productsTable.badge,
      isActive: productsTable.isActive,
      sortOrder: productsTable.sortOrder,
      createdAt: productsTable.createdAt,
      categoryNameEn: categoriesTable.nameEn,
      categoryNameBn: categoriesTable.nameBn,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.isActive, true)))
    .orderBy(asc(productsTable.sortOrder))
    .limit(6);
  res.json(rows);
});

router.get("/products", async (req, res): Promise<void> => {
  const queryParams = ListProductsQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const conditions = [];
  if (queryParams.data.activeOnly === true) {
    conditions.push(eq(productsTable.isActive, true));
  }
  if (
    queryParams.data.categoryId !== null &&
    queryParams.data.categoryId !== undefined
  ) {
    conditions.push(eq(productsTable.categoryId, queryParams.data.categoryId));
  }

  const rows = await db
    .select({
      id: productsTable.id,
      nameBn: productsTable.nameBn,
      nameEn: productsTable.nameEn,
      descriptionBn: productsTable.descriptionBn,
      descriptionEn: productsTable.descriptionEn,
      categoryId: productsTable.categoryId,
      priceBdt: productsTable.priceBdt,
      priceUsd: productsTable.priceUsd,
      badge: productsTable.badge,
      isActive: productsTable.isActive,
      sortOrder: productsTable.sortOrder,
      createdAt: productsTable.createdAt,
      categoryNameEn: categoriesTable.nameEn,
      categoryNameBn: categoriesTable.nameBn,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(productsTable.sortOrder), asc(productsTable.id));
  res.json(rows);
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const product = await getProductWithCategory(params.data.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = {
    nameBn: parsed.data.nameBn,
    nameEn: parsed.data.nameEn,
    descriptionBn: parsed.data.descriptionBn ?? null,
    descriptionEn: parsed.data.descriptionEn ?? null,
    categoryId: parsed.data.categoryId ?? null,
    priceBdt: parsed.data.priceBdt,
    priceUsd: parsed.data.priceUsd,
    badge: parsed.data.badge ?? null,
    isActive: parsed.data.isActive ?? true,
    sortOrder: parsed.data.sortOrder ?? 0,
  };
  const [product] = await db.insert(productsTable).values(data).returning();
  const full = await getProductWithCategory(product.id);
  res.status(201).json(full);
});

router.put("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = {
    nameBn: parsed.data.nameBn,
    nameEn: parsed.data.nameEn,
    descriptionBn: parsed.data.descriptionBn ?? null,
    descriptionEn: parsed.data.descriptionEn ?? null,
    categoryId: parsed.data.categoryId ?? null,
    priceBdt: parsed.data.priceBdt,
    priceUsd: parsed.data.priceUsd,
    badge: parsed.data.badge ?? null,
    isActive: parsed.data.isActive ?? true,
    sortOrder: parsed.data.sortOrder ?? 0,
  };
  const [product] = await db
    .update(productsTable)
    .set(data)
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const full = await getProductWithCategory(product.id);
  res.json(full);
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
