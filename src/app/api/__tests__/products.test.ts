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
  mockProduct,
  createGET,
  createPOST,
  createPUT,
  createDELETE,
} from "./helpers";
import { mockSelectResult, mockInsertResult, mockUpdateResult, mockDeleteResult, resetDbMocks } from "./mock-db";

import { GET as listProducts, POST as createProduct } from "@/app/api/products/route";
import {
  GET as getProduct,
  PUT as updateProduct,
  DELETE as deleteProduct,
} from "@/app/api/products/[id]/route";

// ─── Helpers ────────────────────────────────────────────────────
const idParams = (id: string) => ({ params: Promise.resolve({ id }) });

const validProductBody = {
  name: "Cricket Bat",
  company: "Doaba Sports",
  category: "cricketbats",
  imageSrc: "https://example.com/bat.jpg",
  imageAlt: "Cricket Bat",
  description: "A high quality cricket bat made from English Willow",
  priceRegular: 99.99,
  priceCurrency: "USD",
};

// ═════════════════════════════════════════════════════════════════
// GET /api/products
// ═════════════════════════════════════════════════════════════════
describe("GET /api/products", () => {
  beforeEach(() => resetDbMocks());

  it("returns paginated products", async () => {
    const product = mockProduct();
    mockSelectResult([{ count: 1 }]); // count query
    mockSelectResult([product]); // list query

    const res = await listProducts(
      createGET("http://localhost:3000/api/products"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.products).toHaveLength(1);
    expect(body.pagination.totalCount).toBe(1);
  });

  it("returns products filtered by category", async () => {
    mockSelectResult([{ count: 1 }]);
    mockSelectResult([mockProduct({ category: "cricketbats" })]);

    const res = await listProducts(
      createGET("http://localhost:3000/api/products?category=cricketbats"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.products[0].category).toBe("cricketbats");
  });

  it("returns empty list when no products", async () => {
    mockSelectResult([{ count: 0 }]);
    mockSelectResult([]);

    const res = await listProducts(
      createGET("http://localhost:3000/api/products"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.products).toHaveLength(0);
  });

  it("supports pagination parameters", async () => {
    mockSelectResult([{ count: 25 }]);
    mockSelectResult([mockProduct()]);

    const res = await listProducts(
      createGET("http://localhost:3000/api/products?page=2&limit=10"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.limit).toBe(10);
  });
});

// ═════════════════════════════════════════════════════════════════
// POST /api/products
// ═════════════════════════════════════════════════════════════════
describe("POST /api/products", () => {
  beforeEach(() => resetDbMocks());

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await createProduct(
      createPOST("http://localhost:3000/api/products", validProductBody),
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when not admin", async () => {
    mockCustomer();
    const res = await createProduct(
      createPOST("http://localhost:3000/api/products", validProductBody),
    );
    expect(res.status).toBe(403);
  });

  it("creates product successfully", async () => {
    mockAdmin();
    const product = mockProduct();
    mockInsertResult([product]);

    const res = await createProduct(
      createPOST("http://localhost:3000/api/products", validProductBody),
    );
    expect(res.status).toBe(201);
  });

  it("rejects invalid body (missing required fields)", async () => {
    mockAdmin();
    const res = await createProduct(
      createPOST("http://localhost:3000/api/products", { name: "Test" }),
    );
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════
// GET /api/products/[id]
// ═════════════════════════════════════════════════════════════════
describe("GET /api/products/[id]", () => {
  beforeEach(() => resetDbMocks());

  it("returns product by id", async () => {
    const product = mockProduct();
    mockSelectResult([product]); // cache miss → db query

    const res = await getProduct(
      createGET("http://localhost:3000/api/products/1"),
      idParams("1"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(body.name).toBe("Cricket Bat");
  });

  it("returns 404 for non-existent product", async () => {
    mockSelectResult([]); // no product found

    const res = await getProduct(
      createGET("http://localhost:3000/api/products/999"),
      idParams("999"),
    );
    expect(res.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════
// PUT /api/products/[id]
// ═════════════════════════════════════════════════════════════════
describe("PUT /api/products/[id]", () => {
  beforeEach(() => resetDbMocks());

  it("returns 403 when not admin", async () => {
    mockCustomer();
    const res = await updateProduct(
      createPUT("http://localhost:3000/api/products/1", { name: "Updated" }),
      idParams("1"),
    );
    expect(res.status).toBe(403);
  });

  it("updates product successfully", async () => {
    mockAdmin();
    const updated = mockProduct({ name: "Updated Bat" });
    mockUpdateResult([updated]);

    const res = await updateProduct(
      createPUT("http://localhost:3000/api/products/1", { name: "Updated Bat" }),
      idParams("1"),
    );
    expect(res.status).toBe(200);
  });

  it("returns 404 for non-existent product", async () => {
    mockAdmin();
    mockUpdateResult([]);

    const res = await updateProduct(
      createPUT("http://localhost:3000/api/products/999", { name: "Updated" }),
      idParams("999"),
    );
    expect(res.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════
// DELETE /api/products/[id]
// ═════════════════════════════════════════════════════════════════
describe("DELETE /api/products/[id]", () => {
  beforeEach(() => resetDbMocks());

  it("returns 403 when not admin", async () => {
    mockCustomer();
    const res = await deleteProduct(
      createDELETE("http://localhost:3000/api/products/1"),
      idParams("1"),
    );
    expect(res.status).toBe(403);
  });

  it("rejects deletion when product has active orders", async () => {
    mockAdmin();
    // Active orders referencing this product
    mockSelectResult([{ id: 1, orderNumber: "ORD-2025-000001" }]);

    const res = await deleteProduct(
      createDELETE("http://localhost:3000/api/products/1"),
      idParams("1"),
    );
    expect(res.status).toBe(409);
  });

  it("deletes product successfully", async () => {
    mockAdmin();
    mockSelectResult([]); // no active orders
    const product = mockProduct();
    mockDeleteResult([product]);

    const res = await deleteProduct(
      createDELETE("http://localhost:3000/api/products/1"),
      idParams("1"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain("deleted");
  });

  it("returns 404 for non-existent product", async () => {
    mockAdmin();
    mockSelectResult([]); // no active orders
    mockDeleteResult([]); // no row deleted

    const res = await deleteProduct(
      createDELETE("http://localhost:3000/api/products/999"),
      idParams("999"),
    );
    expect(res.status).toBe(404);
  });
});
