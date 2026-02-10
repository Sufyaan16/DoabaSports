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
  mockCustomer,
  mockUnauthenticated,
  mockWishlistItem,
  mockProduct,
  createGET,
  createPOST,
  createDELETE,
} from "./helpers";
import { mockSelectResult, mockInsertResult, mockDeleteResult, resetDbMocks } from "./mock-db";

import { GET as listWishlist, POST as addToWishlist } from "@/app/api/wishlist/route";
import { DELETE as removeFromWishlist } from "@/app/api/wishlist/[id]/route";
import { GET as checkWishlist } from "@/app/api/wishlist/check/[productId]/route";

// ─── Helpers ────────────────────────────────────────────────────
const idParams = (id: string) => ({ params: Promise.resolve({ id }) });
const productIdParams = (productId: string) => ({ params: Promise.resolve({ productId }) });

// ═════════════════════════════════════════════════════════════════
// GET /api/wishlist
// ═════════════════════════════════════════════════════════════════
describe("GET /api/wishlist", () => {
  beforeEach(() => resetDbMocks());

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await listWishlist(
      createGET("http://localhost:3000/api/wishlist"),
    );
    expect(res.status).toBe(401);
  });

  it("returns user wishlist with pagination", async () => {
    mockCustomer();
    const item = mockWishlistItem();
    const product = mockProduct();
    mockSelectResult([{ count: 1 }]); // count
    mockSelectResult([{ wishlist: item, product }]); // joined query

    const res = await listWishlist(
      createGET("http://localhost:3000/api/wishlist"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.pagination.totalCount).toBe(1);
  });

  it("returns empty wishlist", async () => {
    mockCustomer();
    mockSelectResult([{ count: 0 }]);
    mockSelectResult([]);

    const res = await listWishlist(
      createGET("http://localhost:3000/api/wishlist"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(0);
  });

  it("rejects invalid pagination params", async () => {
    mockCustomer();
    const res = await listWishlist(
      createGET("http://localhost:3000/api/wishlist?limit=100"),
    );
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════
// POST /api/wishlist
// ═════════════════════════════════════════════════════════════════
describe("POST /api/wishlist", () => {
  beforeEach(() => resetDbMocks());

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await addToWishlist(
      createPOST("http://localhost:3000/api/wishlist", { productId: 1 }),
    );
    expect(res.status).toBe(401);
  });

  it("adds product to wishlist", async () => {
    mockCustomer();
    const product = mockProduct();
    mockSelectResult([product]); // product exists check
    mockSelectResult([]); // not already in wishlist
    const newItem = mockWishlistItem();
    mockInsertResult([newItem]);

    const res = await addToWishlist(
      createPOST("http://localhost:3000/api/wishlist", { productId: 1 }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("rejects when product does not exist", async () => {
    mockCustomer();
    mockSelectResult([]); // product not found

    const res = await addToWishlist(
      createPOST("http://localhost:3000/api/wishlist", { productId: 999 }),
    );
    expect(res.status).toBe(404);
  });

  it("rejects duplicate wishlist entry", async () => {
    mockCustomer();
    const product = mockProduct();
    mockSelectResult([product]); // product exists
    const existing = mockWishlistItem();
    mockSelectResult([existing]); // already in wishlist

    const res = await addToWishlist(
      createPOST("http://localhost:3000/api/wishlist", { productId: 1 }),
    );
    expect(res.status).toBe(409);
  });

  it("rejects missing productId", async () => {
    mockCustomer();
    const res = await addToWishlist(
      createPOST("http://localhost:3000/api/wishlist", {}),
    );
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════
// DELETE /api/wishlist/[id]
// ═════════════════════════════════════════════════════════════════
describe("DELETE /api/wishlist/[id]", () => {
  beforeEach(() => resetDbMocks());

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await removeFromWishlist(
      createDELETE("http://localhost:3000/api/wishlist/1"),
      idParams("1"),
    );
    expect(res.status).toBe(401);
  });

  it("removes item from wishlist", async () => {
    mockCustomer();
    const item = mockWishlistItem();
    mockDeleteResult([item]);

    const res = await removeFromWishlist(
      createDELETE("http://localhost:3000/api/wishlist/1"),
      idParams("1"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("returns 404 for non-existent wishlist item", async () => {
    mockCustomer();
    mockDeleteResult([]); // no row deleted

    const res = await removeFromWishlist(
      createDELETE("http://localhost:3000/api/wishlist/999"),
      idParams("999"),
    );
    expect(res.status).toBe(404);
  });

  it("rejects invalid wishlist ID", async () => {
    mockCustomer();
    const res = await removeFromWishlist(
      createDELETE("http://localhost:3000/api/wishlist/abc"),
      idParams("abc"),
    );
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════
// GET /api/wishlist/check/[productId]
// ═════════════════════════════════════════════════════════════════
describe("GET /api/wishlist/check/[productId]", () => {
  beforeEach(() => resetDbMocks());

  it("returns false when not authenticated (soft auth)", async () => {
    mockUnauthenticated();
    const res = await checkWishlist(
      createGET("http://localhost:3000/api/wishlist/check/1"),
      productIdParams("1"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isInWishlist).toBe(false);
  });

  it("returns true when product is in wishlist", async () => {
    mockCustomer();
    const item = mockWishlistItem();
    mockSelectResult([item]); // found in wishlist

    const res = await checkWishlist(
      createGET("http://localhost:3000/api/wishlist/check/1"),
      productIdParams("1"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isInWishlist).toBe(true);
    expect(body.wishlistId).toBe(1);
  });

  it("returns false when product is not in wishlist", async () => {
    mockCustomer();
    mockSelectResult([]); // not in wishlist

    const res = await checkWishlist(
      createGET("http://localhost:3000/api/wishlist/check/99"),
      productIdParams("99"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isInWishlist).toBe(false);
    expect(body.wishlistId).toBeNull();
  });

  it("rejects invalid product ID", async () => {
    mockCustomer();
    const res = await checkWishlist(
      createGET("http://localhost:3000/api/wishlist/check/abc"),
      productIdParams("abc"),
    );
    expect(res.status).toBe(400);
  });
});
