import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  ADMIN_DEFAULT_PASSWORD: z.string().min(8).optional(), // For seeding only
  SENDGRID_API_KEY: z.string().optional().default(''),
  SENDGRID_VERIFIED_SENDER: z.string().email(),
  CONTACT_RECEIVER_EMAIL: z.string().email().optional().default(''),
});

export const env = envSchema.parse(process.env);
