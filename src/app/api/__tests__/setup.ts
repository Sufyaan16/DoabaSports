/**
 * Setup file for API integration tests.
 * Mocks external dependencies: DB, StackAuth, Rate Limiting, Redis cache, email.
 */
import { vi } from "vitest";

// ─── Mock Next.js server-only module ─────────────────────────────
// StackAuth server imports "server-only" which throws in test env
vi.mock("server-only", () => ({}));

// ─── Mock Database ──────────────────────────────────────────────
vi.mock("@/db", () => {
  return import("./mock-db").then((m) => ({ default: m.mockDb }));
});

// ─── Mock StackAuth ─────────────────────────────────────────────
vi.mock("@/stack/server", () => ({
  stackServerApp: {
    getUser: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock("@/stack/client", () => ({
  stackClientApp: {},
}));

// ─── Mock Rate Limiting (always allow) ──────────────────────────
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null), // null = not rate limited
  getRateLimitIdentifier: vi.fn().mockReturnValue("test-id"),
  getIpAddress: vi.fn().mockReturnValue("127.0.0.1"),
}));

// ─── Mock Redis cache (always miss → call DB) ──────────────────
vi.mock("@/lib/cache", () => ({
  getOrSet: vi.fn(
    async (_namespace: string, _key: string, fn: () => Promise<any>) => fn(),
  ),
  invalidateNamespace: vi.fn().mockResolvedValue(undefined),
  deleteCache: vi.fn().mockResolvedValue(undefined),
}));

// ─── Mock Email (Resend) ────────────────────────────────────────
vi.mock("@/emails/send", () => ({
  sendOrderConfirmation: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/resend", () => ({
  getResend: vi.fn().mockReturnValue({
    emails: { send: vi.fn().mockResolvedValue({ id: "test-email-id" }) },
  }),
}));
