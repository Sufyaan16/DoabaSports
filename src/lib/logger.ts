/**
 * Structured logger for production use.
 *
 * Outputs JSON in production (parseable by Vercel, Datadog, etc.)
 * and human-readable format in development.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("Order created", { orderId: "123", userId: "abc" });
 *   logger.error("Payment failed", { orderId: "123", error: err });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  // Serialize errors to be JSON-safe
  if (entry.error instanceof Error) {
    entry.error = {
      name: (entry.error as Error).name,
      message: (entry.error as Error).message,
      stack: IS_PRODUCTION ? undefined : (entry.error as Error).stack,
    };
  }

  if (IS_PRODUCTION) {
    // JSON output for log aggregators
    const output = JSON.stringify(entry);
    switch (level) {
      case "error":
        console.error(output);
        break;
      case "warn":
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  } else {
    // Human-readable for development
    const prefix = { debug: "🔍", info: "ℹ️", warn: "⚠️", error: "❌" }[level];
    const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    switch (level) {
      case "error":
        console.error(`${prefix} ${message}${metaStr}`);
        break;
      case "warn":
        console.warn(`${prefix} ${message}${metaStr}`);
        break;
      default:
        console.log(`${prefix} ${message}${metaStr}`);
    }
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => formatLog("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => formatLog("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => formatLog("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => formatLog("error", message, meta),
};
