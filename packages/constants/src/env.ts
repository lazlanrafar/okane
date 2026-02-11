import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Helper to find and load .env file
function loadEnv() {
  // If strict env vars are already present, skip loading
  if (process.env.DATABASE_URL && process.env.SUPABASE_URL) return;

  let current = process.cwd();
  // Traverse up up to 3 levels to find .env
  for (let i = 0; i < 3; i++) {
    const envPath = path.join(current, ".env");
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return;
    }
    current = path.dirname(current);
  }
}

// Load env before defining schema (only if file system is available)
try {
  loadEnv();
} catch (e) {
  // Ignored in browser/edge environments where fs is not available
}

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // API
  API_PORT: z.string().optional().default("3001"),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Logging
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .optional()
    .default("info"),
  LOG_PRETTY: z.string().optional(), // "true" or "false"
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and throws if any are missing/invalid.
 * Use this at application startup.
 */
export function validateEnv(): Env {
  // If running in browser, filter out server-side only variables?
  // But typically this package is consumed by server-side code or build scripts.
  // For client-side, we rely on NEXT_PUBLIC_ prefix handling by framework.

  // Parse process.env
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

// Export a typed process.env proxy (optional, but validateEnv is safer)
export const env = process.env as unknown as Env;
