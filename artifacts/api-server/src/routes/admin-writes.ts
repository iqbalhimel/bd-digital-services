import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, categoriesTable, productsTable, siteSettingsTable, noticesTable } from "@workspace/db";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  UpdateCategoryParams,
  DeleteCategoryParams,
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
  UpdateSettingsBody,
  CreateNoticeBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { asc } from "drizzle-orm";

const router: IRouter = Router();

router.use(requireAdmin);

// ---- Category mutations ----
router.post("/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [cat] = await db.insert(categoriesTable).values({
    ...parsed.data,
    sortOrder: parsed.data.sortOrder ?? 0,
    isActive: parsed.data.isActive ?? true,
  }).returning();
  res.status(201).json(cat);
});

router.put("/categories/:id", async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [cat] = await db.update(categoriesTable).set({
    ...parsed.data,
    sortOrder: parsed.data.sortOrder ?? 0,
    isActive: parsed.data.isActive ?? true,
  }).where(eq(categoriesTable.id, params.data.id)).returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  res.json(cat);
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [deleted] = await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

// ---- Product helpers ----
async function getProductFull(id: number) {
  const rows = await db.select({
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
  }).from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ---- Product mutations ----
router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.insert(productsTable).values({
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
  }).returning();
  res.status(201).json(await getProductFull(product.id));
});

router.put("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.update(productsTable).set({
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
  }).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await getProductFull(product.id));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

// ---- Settings mutations ----
const DEFAULT_SETTINGS: Record<string, string> = {
  siteName: "BD Digital Services",
  whatsapp: "+8801572792499",
  telegram: "+8801572792499",
  bkashNumber: "01687476714",
  nagadNumber: "01687476714",
  rocketNumber: "01687476714",
  footerText: "© 2025 BD Digital Services. সকল অধিকার সংরক্ষিত।",
  primaryColor: "#7c3aed",
  secondaryColor: "#06b6d4",
  accentColor: "#f59e0b",
};

router.put("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === undefined) continue;
    const existing = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).limit(1);
    if (existing.length > 0) {
      await db.update(siteSettingsTable).set({ value: value as string }).where(eq(siteSettingsTable.key, key));
    } else {
      await db.insert(siteSettingsTable).values({ key, value: value as string });
    }
  }
  const rows = await db.select().from(siteSettingsTable);
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;
  res.json({
    siteName: settings.siteName ?? DEFAULT_SETTINGS.siteName,
    whatsapp: settings.whatsapp ?? DEFAULT_SETTINGS.whatsapp,
    telegram: settings.telegram ?? DEFAULT_SETTINGS.telegram,
    bkashNumber: settings.bkashNumber ?? DEFAULT_SETTINGS.bkashNumber,
    nagadNumber: settings.nagadNumber ?? DEFAULT_SETTINGS.nagadNumber,
    rocketNumber: settings.rocketNumber ?? DEFAULT_SETTINGS.rocketNumber,
    footerText: settings.footerText ?? DEFAULT_SETTINGS.footerText,
    primaryColor: settings.primaryColor ?? DEFAULT_SETTINGS.primaryColor,
    secondaryColor: settings.secondaryColor ?? DEFAULT_SETTINGS.secondaryColor,
    accentColor: settings.accentColor ?? DEFAULT_SETTINGS.accentColor,
  });
});

// ---- Notice mutations (POST + PUT both work) ----
async function createActiveNotice(messageBn: string, messageEn: string, isActive: boolean) {
  await db.update(noticesTable).set({ isActive: false }).where(eq(noticesTable.isActive, true));
  const [notice] = await db.insert(noticesTable).values({ messageBn, messageEn, isActive }).returning();
  return notice;
}

router.post("/notice", async (req, res): Promise<void> => {
  const parsed = CreateNoticeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  res.json(await createActiveNotice(parsed.data.messageBn, parsed.data.messageEn, parsed.data.isActive ?? true));
});

router.put("/notice", async (req, res): Promise<void> => {
  const parsed = CreateNoticeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  res.json(await createActiveNotice(parsed.data.messageBn, parsed.data.messageEn, parsed.data.isActive ?? true));
});

export default router;
