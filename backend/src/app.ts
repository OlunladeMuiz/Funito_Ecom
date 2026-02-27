import express from "express";
import path from "path";
export const app = express();
// Trust Railway/Proxy headers for correct client IP and rate limiting
app.set('trust proxy', 1);
// Serve uploaded product images statically (before JSON middleware)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { routes } from "./routes";
import { errorHandler } from "./middleware/error";
import { paymentsRouter } from "./modules/payments/payments.routes";
import { Request, Response, NextFunction } from "express";


// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'https://funito-ecom.vercel.app',
  credentials: true
}));
app.use(morgan("dev"));

// Rate limiting - skip in test environment
const isTest = process.env.NODE_ENV === "test" || process.env.VITEST;
const skipRateLimiter = (_req: express.Request) => !!isTest;

// Rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window for auth routes
  message: { message: "Too many attempts. Please try again later.", code: "RATE_LIMITED" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimiter,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { message: "Too many requests. Please slow down.", code: "RATE_LIMITED" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimiter,
});

// Apply rate limiters
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/refresh", authLimiter);
app.use("/api", apiLimiter);

app.use(
  "/api/payments",
  express.raw({ type: "application/json" }),
  paymentsRouter
);

app.use(express.json({ limit: "1mb" }));
app.use("/api", routes);

app.use(errorHandler);

// Centralized error middleware for Prisma and other errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    return res.status(400).json({ message: 'Database error' });
  }
  res.status(500).json({ message: 'Something went wrong' });
});
