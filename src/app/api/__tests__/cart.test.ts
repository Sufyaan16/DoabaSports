import { vi, describe, it, expect, beforeEach } from "vitest";

// ─── Module mocks (hoisted above all imports by vitest) ─────────
vi.mock("server-only", () => ({}));

vi.mock("@/db", async () => {
  const { mockDb } = await import("./mock-db");
  return { default: mockDb };
});

vi.mock("@/stack/server", () => ({
  stackServerApp: {
    getUser: vi.fn().mockResolvedValue(null),
  },
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
}));

// ─── Imports (resolved AFTER mocks are registered) ──────────────
import {
  mockCustomer,
  mockUnauthenticated,
  mockCart,
  createGET,
  createPOST,
  createPUT,
  createDELETE,
} from "./helpers";
import {
  mockSelectResult,
  mockInsertResult,
  mockUpdateResult,
  resetDbMocks,
} from "./mock-db";

// Import route handlers
import { GET, POST, PUT, DELETE } from "@/app/api/cart/route";

describe("GET /api/cart", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await GET(createGET("http://localhost:3000/api/cart"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("AUTH_REQUIRED");
  });

  it("returns existing cart for authenticated user", async () => {
    mockCustomer();
    const cart = mockCart();
    mockSelectResult([cart]);

    const res = await GET(createGET("http://localhost:3000/api/cart"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("user-123");
    expect(body.items).toHaveLength(1);
  });

  it("creates empty cart if none exists", async () => {
    mockCustomer();
    mockSelectResult([]); // No cart found
    const newCart = mockCart({ items: [] });
    mockInsertResult([newCart]);

    const res = await GET(createGET("http://localhost:3000/api/cart"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([]);
  });
});

describe("POST /api/cart", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await POST(
      createPOST("http://localhost:3000/api/cart", {
        items: [{ productId: 1, quantity: 1 }],
      }),
    );
    expect(res.status).toBe(401);
  });

  it("creates new cart when none exists", async () => {
    mockCustomer();
    mockSelectResult([]); // No existing cart
    const newCart = mockCart({ items: [{ productId: 1, quantity: 3 }] });
    mockInsertResult([newCart]);

    const res = await POST(
      createPOST("http://localhost:3000/api/cart", {
        items: [{ productId: 1, quantity: 3 }],
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([{ productId: 1, quantity: 3 }]);
  });

  it("updates existing cart", async () => {
    mockCustomer();
    mockSelectResult([mockCart()]); // Existing cart
    const updatedCart = mockCart({ items: [{ productId: 2, quantity: 5 }] });
    mockUpdateResult([updatedCart]);

    const res = await POST(
      createPOST("http://localhost:3000/api/cart", {
        items: [{ productId: 2, quantity: 5 }],
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([{ productId: 2, quantity: 5 }]);
  });

  it("rejects invalid items (negative quantity)", async () => {
    mockCustomer();
    const res = await POST(
      createPOST("http://localhost:3000/api/cart", {
        items: [{ productId: 1, quantity: -1 }],
      }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects items with quantity > 99", async () => {
    mockCustomer();
    const res = await POST(
      createPOST("http://localhost:3000/api/cart", {
        items: [{ productId: 1, quantity: 100 }],
      }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects invalid productId (0)", async () => {
    mockCustomer();
    const res = await POST(
      createPOST("http://localhost:3000/api/cart", {
        items: [{ productId: 0, quantity: 1 }],
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/cart", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await PUT(
      createPUT("http://localhost:3000/api/cart", {
        productId: 1,
        quantity: 1,
      }),
    );
    expect(res.status).toBe(401);
  });

  it("adds new item to existing cart", async () => {
    mockCustomer();
    const existingCart = mockCart({ items: [{ productId: 1, quantity: 2 }] });
    mockSelectResult([existingCart]);
    const updatedCart = mockCart({
      items: [
        { productId: 1, quantity: 2 },
        { productId: 3, quantity: 1 },
      ],
    });
    mockUpdateResult([updatedCart]);

    const res = await PUT(
      createPUT("http://localhost:3000/api/cart", {
        productId: 3,
        quantity: 1,
      }),
    );
    expect(res.status).toBe(200);
  });

  it("removes item when quantity is 0", async () => {
    mockCustomer();
    const existingCart = mockCart({ items: [{ productId: 1, quantity: 2 }] });
    mockSelectResult([existingCart]);
    const updatedCart = mockCart({ items: [] });
    mockUpdateResult([updatedCart]);

    const res = await PUT(
      createPUT("http://localhost:3000/api/cart", {
        productId: 1,
        quantity: 0,
      }),
    );
    expect(res.status).toBe(200);
  });

  it("rejects missing productId", async () => {
    mockCustomer();
    const res = await PUT(
      createPUT("http://localhost:3000/api/cart", { quantity: 1 }),
    );
    expect(res.status).toBe(400);
  });

  it("creates cart if none exists and adds item", async () => {
    mockCustomer();
    mockSelectResult([]); // No cart
    const newCart = mockCart({ items: [{ productId: 5, quantity: 2 }] });
    mockInsertResult([newCart]);

    const res = await PUT(
      createPUT("http://localhost:3000/api/cart", {
        productId: 5,
        quantity: 2,
      }),
    );
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/cart", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await DELETE(
      createDELETE("http://localhost:3000/api/cart"),
    );
    expect(res.status).toBe(401);
  });

  it("clears cart items", async () => {
    mockCustomer();
    const clearedCart = mockCart({ items: [] });
    mockUpdateResult([clearedCart]);

    const res = await DELETE(
      createDELETE("http://localhost:3000/api/cart"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([]);
  });

  it("returns 404 when cart not found", async () => {
    mockCustomer();
    mockUpdateResult([]); // No cart to update

    const res = await DELETE(
      createDELETE("http://localhost:3000/api/cart"),
    );
    expect(res.status).toBe(404);
  });
});
