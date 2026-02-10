import { vi, describe, it, expect, beforeEach } from "vitest";

// ─── Module mocks (hoisted by vitest) ───────────────────────────
vi.mock("server-only", () => ({}));
vi.mock("@/db", async () => {
  const { mockDb } = await import("./mock-db");
  return { default: mockDb };
});
vi.mock("@/db/index", async () => {
  const { mockDb } = await import("./mock-db");
  return { default: mockDb };
});
vi.mock("@/stack/server", () => ({
  stackServerApp: { getUser: vi.fn().mockResolvedValue(null) },
}));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
  getRateLimitIdentifier: vi.fn().mockReturnValue("test-id"),
  getIpAddress: vi.fn().mockReturnValue("127.0.0.1"),
}));

// ─── Imports ────────────────────────────────────────────────────
import { createGET, mockProduct } from "./helpers";
import { mockSelectResult, resetDbMocks } from "./mock-db";

import { GET } from "@/app/api/products/search/route";

// ═════════════════════════════════════════════════════════════════
// GET /api/products/search
// ═════════════════════════════════════════════════════════════════
describe("GET /api/products/search", () => {
  beforeEach(() => resetDbMocks());

  it("returns search results matching query", async () => {
    const product = mockProduct({ name: "Cricket Bat" });
    mockSelectResult([{ count: 1 }]); // count
    mockSelectResult([product]); // results

    const res = await GET(
      createGET("http://localhost:3000/api/products/search?q=Cricket"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results).toHaveLength(1);
    expect(body.query).toBe("Cricket");
  });

  it("rejects query shorter than 2 characters", async () => {
    const res = await GET(
      createGET("http://localhost:3000/api/products/search?q=a"),
    );
    expect(res.status).toBe(400);
  });

  it("rejects missing query parameter", async () => {
    const res = await GET(
      createGET("http://localhost:3000/api/products/search"),
    );
    expect(res.status).toBe(400);
  });

  it("returns empty results for non-matching query", async () => {
    mockSelectResult([{ count: 0 }]);
    mockSelectResult([]);

    const res = await GET(
      createGET("http://localhost:3000/api/products/search?q=nonexistent"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results).toHaveLength(0);
    expect(body.pagination.totalCount).toBe(0);
  });

  it("supports pagination", async () => {
    mockSelectResult([{ count: 20 }]);
    mockSelectResult([mockProduct()]);

    const res = await GET(
      createGET("http://localhost:3000/api/products/search?q=bat&page=2&limit=5"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.limit).toBe(5);
    expect(body.pagination.totalPages).toBe(4);
  });

  it("supports category filter", async () => {
    mockSelectResult([{ count: 1 }]);
    mockSelectResult([mockProduct({ category: "cricketbats" })]);

    const res = await GET(
      createGET("http://localhost:3000/api/products/search?q=bat&category=cricketbats"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results[0].category).toBe("cricketbats");
  });

  it("supports sort by newest", async () => {
    mockSelectResult([{ count: 1 }]);
    mockSelectResult([mockProduct()]);

    const res = await GET(
      createGET("http://localhost:3000/api/products/search?q=bat&sortBy=newest"),
    );
    expect(res.status).toBe(200);
  });
});
