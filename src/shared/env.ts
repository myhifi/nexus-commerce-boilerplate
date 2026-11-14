// src/shared/lib/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Runtime environment validation.
 * Fails loudly at build/start if any required variable is missing or malformed.
 * Never access `process.env.X` directly — always import { env } from "@/shared/lib/env".
 */
export const env = createEnv({
  server: {
    // ─── Database (Supabase Postgres) ───
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),

    // ─── Auth (Auth.js v5) ───
    AUTH_SECRET: z.string().min(32),

    // ─── Supabase service role (server only) ───
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // ─── Rate limiting (Upstash — optional until Phase 4) ───
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

    // ─── Email ───
    EMAIL_PROVIDER: z.enum(["console", "resend"]).default("console"),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),

    // ─── Payments (Phase 3) ───
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  client: {
    // ─── App ───
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_STORE_NAME: z.string().min(1),
    NEXT_PUBLIC_BUSINESS_TYPE: z.enum(["RETAIL", "RESTAURANT"]),
    NEXT_PUBLIC_STORE_TIER: z.enum(["BASIC", "PRO", "ENTERPRISE"]),
    NEXT_PUBLIC_CURRENCY: z.string().length(3),

    // ─── Supabase (client) ───
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),

    // ─── Sentry (added in 0.9) ───
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
    NEXT_PUBLIC_BUSINESS_TYPE: process.env.NEXT_PUBLIC_BUSINESS_TYPE,
    NEXT_PUBLIC_STORE_TIER: process.env.NEXT_PUBLIC_STORE_TIER,
    NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },

  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});