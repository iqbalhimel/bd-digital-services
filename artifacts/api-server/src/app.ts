import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { globalLimiter } from "./middlewares/rateLimits";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = isProduction
  ? [
      "https://bddigitalservices.com",
      "https://www.bddigitalservices.com",
      process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "",
    ].filter(Boolean)
  : [
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
      process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "",
    ].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    const allowed = allowedOrigins.some((o) =>
      typeof o === "string" ? o === origin : o.test(origin),
    );
    if (allowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
};

const app: Express = express();

// Trust the first proxy hop (Replit / Cloudflare / Hostinger reverse proxy)
// so that rate limiting uses the real client IP from X-Forwarded-For
app.set("trust proxy", 1);

// Helmet first — sets security headers on every response
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,
  }),
);

app.use(
  pinoHttp({
    logger,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.body.password",
        "req.body.token",
        "req.body.secret",
      ],
      censor: "[REDACTED]",
    },
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// CORS — pass false for denied origins; a custom handler returns 403
app.use(cors(corsOptions));
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin) {
    const allowed = allowedOrigins.some((o) =>
      typeof o === "string" ? o === origin : o.test(origin),
    );
    if (!allowed && !res.headersSent) {
      res.status(403).json({ error: "CORS: origin not allowed" });
      return;
    }
  }
  next();
});

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use(hpp());

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url && req.url.length > 2000) {
    res.status(414).json({ error: "URI Too Long" });
    return;
  }
  next();
});

// Global rate limiter — skip health endpoints so uptime monitors always pass
const HEALTH_PATHS = new Set(["/api/health", "/api/healthz"]);
app.use((req: Request, res: Response, next: NextFunction) => {
  if (HEALTH_PATHS.has(req.path)) {
    next();
    return;
  }
  globalLimiter(req, res, next);
});

app.use("/api", router);

if (isProduction) {
  const frontendBuildPath = path.resolve(__dirname, "../../bd-digital-services/dist/public");
  app.use(express.static(frontendBuildPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

export default app;
