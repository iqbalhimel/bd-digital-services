import type { Request, Response, NextFunction } from "express";
import { createHmac } from "crypto";

function getSecret(): string | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") return null;
    // Dev-only fallback — never used in production
    return "bd-digital-services-dev-secret";
  }
  return secret;
}

function verifyToken(token: string): boolean {
  try {
    const secret = getSecret();
    if (!secret) return false; // missing ADMIN_SECRET in production → always reject

    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [encodedUsername, timestamp, hmac] = parts;
    const username = Buffer.from(encodedUsername, "base64").toString("utf8");
    const expected = createHmac("sha256", secret)
      .update(`${username}:${timestamp}`)
      .digest("hex");
    if (expected !== hmac) return false;
    const ts = Number(timestamp);
    const age = Date.now() - ts;
    // Token expires after 7 days
    if (age > 7 * 24 * 60 * 60 * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  if (!verifyToken(token)) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  next();
}
