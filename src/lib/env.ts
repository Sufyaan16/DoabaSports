import { z } from "zod";

/**
 * Server-side environment variable validation.
 * Validates all required env vars at startup so the app fails fast
 * instead of crashing later with cryptic errors.
 */
const serverEnvSchema = z.object({
  // Database (required)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Stack Auth (required)
  NEXT_PUBLIC_STACK_PROJECT_ID: z.string().min(1, "NEXT_PUBLIC_STACK_PROJECT_ID is required"),
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().min(1, "NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY is required"),
  STACK_SECRET_SERVER_KEY: z.string().min(1, "STACK_SECRET_SERVER_KEY is required"),

  // Resend Email (optional — emails disabled without it)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Upstash Redis (optional — rate limiting disabled without it)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Sentry (optional — error tracking disabled without it)
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // App URL for CSRF origin check
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Cloudinary (optional — image uploads disabled without it)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _env: ServerEnv | null = null;

/**
 * Parse and validate environment variables.
 * Caches the result so parsing only happens once.
 */
export function getEnv(): ServerEnv {
  if (_env) return _env;

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    console.error("❌ Invalid environment variables:", formatted);
    throw new Error(
      `Missing or invalid environment variables:\n${Object.entries(formatted)
        .map(([key, errs]) => `  ${key}: ${errs?.join(", ")}`)
        .join("\n")}`
    );
  }

  _env = result.data;
  return _env;
}

/**
 * Validate env vars at import time in production.
 * In development, we validate lazily to allow partial configs.
 */
if (process.env.NODE_ENV === "production") {
  getEnv();
}
