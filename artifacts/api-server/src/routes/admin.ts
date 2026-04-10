import { Router, type IRouter } from "express";
import { AdminLoginBody } from "@workspace/api-zod";
import { createHmac } from "crypto";

const router: IRouter = Router();

function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SECRET environment variable is required in production");
  }
  return secret ?? "bd-digital-services-dev-secret";
}

function generateToken(username: string): string {
  const secret = getAdminSecret();
  const timestamp = Date.now().toString();
  const hmac = createHmac("sha256", secret)
    .update(`${username}:${timestamp}`)
    .digest("hex");
  return `${Buffer.from(username).toString("base64")}.${timestamp}.${hmac}`;
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword && process.env.NODE_ENV === "production") {
    req.log.error("ADMIN_PASSWORD is not set in production");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  const effectivePassword = adminPassword ?? "admin123";

  if (
    parsed.data.username !== adminUsername ||
    parsed.data.password !== effectivePassword
  ) {
    req.log.warn({ username: parsed.data.username }, "Failed admin login");
    res.status(401).json({ error: "ভুল username বা password" });
    return;
  }

  const token = generateToken(parsed.data.username);
  req.log.info({ username: parsed.data.username }, "Admin logged in");
  res.json({ token, message: "লগইন সফল হয়েছে" });
});

export default router;
