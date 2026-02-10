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
vi.mock("@/lib/cache", () => ({
  getOrSet: vi.fn(
    async (_ns: string, _key: string, fn: () => Promise<unknown>) => fn(),
  ),
  invalidateNamespace: vi.fn().mockResolvedValue(undefined),
  deleteCache: vi.fn().mockResolvedValue(undefined),
  deleteFromCache: vi.fn().mockResolvedValue(undefined),
  CACHE_TTL: { CATEGORIES: 300, PRODUCTS: 300, PRODUCT_DETAIL: 300, USER_DATA: 120 },
}));

// ─── Imports ────────────────────────────────────────────────────
import {
  mockAdmin,
  mockCustomer,
  mockUnauthenticated,
  mockCategory,
  createGET,
  createPOST,
  createPUT,
  createDELETE,
} from "./helpers";
import { mockSelectResult, mockInsertResult, mockUpdateResult, mockDeleteResult, resetDbMocks } from "./mock-db";

import { GET as listCategories, POST as createCategory } from "@/app/api/categories/route";
import {
  GET as getCategory,
  PUT as updateCategory,
  DELETE as deleteCategory,
} from "@/app/api/categories/[slug]/route";

// ─── Helpers ────────────────────────────────────────────────────
const slugParams = (slug: string) => ({ params: Promise.resolve({ slug }) });

const validCategoryBody = {
  slug: "cricket-bats",
  name: "Cricket Bats",
  description: "High quality cricket bats for professionals",
  longDescription: "Our cricket bats are made from the finest English Willow and Kashmir Willow wood.",
  image: "https://example.com/category.jpg",
};

// ═════════════════════════════════════════════════════════════════
// GET /api/categories
// ═════════════════════════════════════════════════════════════════
describe("GET /api/categories", () => {
  beforeEach(() => resetDbMocks());

  it("returns paginated categories", async () => {
    const cat = mockCategory();
    mockSelectResult([{ count: 1 }]); // count query
    mockSelectResult([cat]); // list query

    const res = await listCategories(
      createGET("http://localhost:3000/api/categories"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.categories).toHaveLength(1);
    expect(body.pagination.totalCount).toBe(1);
  });

  it("returns empty list when no categories", async () => {
    mockSelectResult([{ count: 0 }]);
    mockSelectResult([]);

    const res = await listCategories(
      createGET("http://localhost:3000/api/categories"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.categories).toHaveLength(0);
  });

  it("rejects invalid pagination params", async () => {
    const res = await listCategories(
      createGET("http://localhost:3000/api/categories?page=0&limit=200"),
    );
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════
// POST /api/categories
// ═════════════════════════════════════════════════════════════════
describe("POST /api/categories", () => {
  beforeEach(() => resetDbMocks());

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await createCategory(
      createPOST("http://localhost:3000/api/categories", validCategoryBody),
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when not admin", async () => {
    mockCustomer();
    const res = await createCategory(
      createPOST("http://localhost:3000/api/categories", validCategoryBody),
    );
    expect(res.status).toBe(403);
  });

  it("creates category successfully", async () => {
    mockAdmin();
    const cat = mockCategory();
    mockInsertResult([cat]);

    const res = await createCategory(
      createPOST("http://localhost:3000/api/categories", validCategoryBody),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.slug).toBe("cricketbats");
  });

  it("rejects invalid body (missing name)", async () => {
    mockAdmin();
    const res = await createCategory(
      createPOST("http://localhost:3000/api/categories", { slug: "test" }),
    );
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════
// GET /api/categories/[slug]
// ═════════════════════════════════════════════════════════════════
describe("GET /api/categories/[slug]", () => {
  beforeEach(() => resetDbMocks());

  it("returns category by slug", async () => {
    const cat = mockCategory();
    mockSelectResult([cat]);

    const res = await getCategory(
      createGET("http://localhost:3000/api/categories/cricketbats"),
      slugParams("cricketbats"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe("cricketbats");
  });

  it("returns 404 for non-existent slug", async () => {
    mockSelectResult([]); // no category found

    const res = await getCategory(
      createGET("http://localhost:3000/api/categories/nonexistent"),
      slugParams("nonexistent"),
    );
    expect(res.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════
// PUT /api/categories/[slug]
// ═════════════════════════════════════════════════════════════════
describe("PUT /api/categories/[slug]", () => {
  beforeEach(() => resetDbMocks());

  it("returns 403 when not admin", async () => {
    mockCustomer();
    const res = await updateCategory(
      createPUT("http://localhost:3000/api/categories/cricketbats", {
        name: "Updated Name",
      }),
      slugParams("cricketbats"),
    );
    expect(res.status).toBe(403);
  });

  it("updates category successfully", async () => {
    mockAdmin();
    const updated = mockCategory({ name: "Updated Bats" });
    mockUpdateResult([updated]);

    const res = await updateCategory(
      createPUT("http://localhost:3000/api/categories/cricketbats", {
        name: "Updated Bats",
      }),
      slugParams("cricketbats"),
    );
    expect(res.status).toBe(200);
  });

  it("returns 404 for non-existent slug", async () => {
    mockAdmin();
    mockUpdateResult([]); // no row updated

    const res = await updateCategory(
      createPUT("http://localhost:3000/api/categories/nonexistent", {
        name: "Updated",
      }),
      slugParams("nonexistent"),
    );
    expect(res.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════
// DELETE /api/categories/[slug]
// ═════════════════════════════════════════════════════════════════
describe("DELETE /api/categories/[slug]", () => {
  beforeEach(() => resetDbMocks());

  it("returns 403 when not admin", async () => {
    mockCustomer();
    const res = await deleteCategory(
      createDELETE("http://localhost:3000/api/categories/cricketbats"),
      slugParams("cricketbats"),
    );
    expect(res.status).toBe(403);
  });

  it("rejects deletion when category has products", async () => {
    mockAdmin();
    mockSelectResult([{ count: 5 }]); // 5 products in category

    const res = await deleteCategory(
      createDELETE("http://localhost:3000/api/categories/cricketbats"),
      slugParams("cricketbats"),
    );
    expect(res.status).toBe(409);
  });

  it("deletes category successfully", async () => {
    mockAdmin();
    mockSelectResult([{ count: 0 }]); // no products in category
    const cat = mockCategory();
    mockDeleteResult([cat]);

    const res = await deleteCategory(
      createDELETE("http://localhost:3000/api/categories/cricketbats"),
      slugParams("cricketbats"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain("deleted");
  });

  it("returns 404 for non-existent slug", async () => {
    mockAdmin();
    mockSelectResult([{ count: 0 }]); // no products
    mockDeleteResult([]); // no row deleted

    const res = await deleteCategory(
      createDELETE("http://localhost:3000/api/categories/nonexistent"),
      slugParams("nonexistent"),
    );
    expect(res.status).toBe(404);
  });
});
