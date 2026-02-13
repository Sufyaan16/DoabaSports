import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring — sample 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replay — capture 1% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  // Only send events when DSN is configured
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Filter noisy errors
  ignoreErrors: [
    // Browser extensions & network
    "ResizeObserver loop",
    "Network request failed",
    "Load failed",
    "Failed to fetch",
    // Next.js hydration
    "Hydration failed",
    "Text content does not match",
  ],

  environment: process.env.NODE_ENV || "development",
});
