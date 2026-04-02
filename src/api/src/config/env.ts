import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_DIR: z.string().min(1).default("./logs"),
  LOG_RETENTION_DAYS: z.coerce.number().int().positive().default(30),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  PAYMENT_NOTIFY_URL: z.string().min(1).default("http://localhost:3000"),
  BITIFUL_S4_ENDPOINT: z.string().url().optional(),
  BITIFUL_S4_REGION: z.string().min(1).optional(),
  BITIFUL_S4_BUCKET: z.string().min(1).optional(),
  BITIFUL_S4_ACCESS_KEY: z.string().min(1).optional(),
  BITIFUL_S4_SECRET_KEY: z.string().min(1).optional(),
  BITIFUL_S4_PUBLIC_BASE_URL: z.string().url().optional(),
  BITIFUL_S4_DEFAULT_PROJECT: z.string().min(1).default("resource-hub"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = {
  ...parsed.data,
  LOG_LEVEL: parsed.data.LOG_LEVEL ?? "debug",
};
