import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, noticesTable } from "@workspace/db";
import { CreateNoticeBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notice", async (_req, res): Promise<void> => {
  const [notice] = await db
    .select()
    .from(noticesTable)
    .where(eq(noticesTable.isActive, true))
    .orderBy(noticesTable.createdAt)
    .limit(1);
  if (!notice) {
    res.status(404).json({ error: "No active notice" });
    return;
  }
  res.json(notice);
});

router.post("/notice", async (req, res): Promise<void> => {
  const parsed = CreateNoticeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  // Deactivate all existing notices first
  await db
    .update(noticesTable)
    .set({ isActive: false })
    .where(eq(noticesTable.isActive, true));

  const [notice] = await db
    .insert(noticesTable)
    .values({
      messageBn: parsed.data.messageBn,
      messageEn: parsed.data.messageEn,
      isActive: parsed.data.isActive ?? true,
    })
    .returning();
  res.json(notice);
});

export default router;
