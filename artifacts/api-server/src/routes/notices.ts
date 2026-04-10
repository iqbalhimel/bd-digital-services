import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, noticesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/notice", async (_req, res): Promise<void> => {
  const [notice] = await db
    .select()
    .from(noticesTable)
    .where(eq(noticesTable.isActive, true))
    .orderBy(noticesTable.createdAt)
    .limit(1);
  if (!notice) {
    res.json(null);
    return;
  }
  res.json(notice);
});

export default router;
