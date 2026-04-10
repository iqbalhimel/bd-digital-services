import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";

const router: IRouter = Router();

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

async function ensureDefaultSettings() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, key))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(siteSettingsTable).values({ key, value });
    }
  }
}

router.get("/settings", async (_req, res): Promise<void> => {
  await ensureDefaultSettings();
  const rows = await db.select().from(siteSettingsTable);
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
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

export default router;
