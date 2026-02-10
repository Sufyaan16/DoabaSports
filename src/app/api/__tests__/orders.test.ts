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
vi.mock("@/lib/resend", () => ({
  getResend: vi.fn().mockReturnValue(null), // no Resend → skip email
}));
vi.mock("@/emails/order-confirmation", () => ({
  default: vi.fn().mockReturnValue(null),
}));
// Mock price calculator to avoid complex DB interaction chains
vi.mock("@/lib/price-calculator", () => ({
  calculateOrderPrices: vi.fn(),
}));

// ─── Imports ────────────────────────────────────────────────────
import {
  mockAdmin,
  mockCustomer,
  mockUnauthenticated,
  mockOrder,
  mockProduct,
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
import { calculateOrderPrices } from "@/lib/price-calculator";

import { GET as listOrders, POST as createOrder } from "@/app/api/orders/route";
import {
  GET as getOrder,
  PUT as updateOrder,
  DELETE as deleteOrder,
} from "@/app/api/orders/[id]/route";
import { GET as getMyOrders } from "@/app/api/orders/my-orders/route";
import { POST as cancelOrder } from "@/app/api/orders/[id]/cancel/route";
import { POST as refundOrder } from "@/app/api/orders/[id]/refund/route";

// ─── Helpers ────────────────────────────────────────────────────
const idParams = (id: string) => ({ params: Promise.resolve({ id }) });

const validOrderBody = {
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+15551234567",
  shippingAddress: "123 Main St",
  shippingCity: "New York",
  shippingState: "NY",
  shippingZip: "10001",
  items: [{ productId: 1, quantity: 2, price: 79.99, total: 159.98, productName: "Cricket Bat", productImage: "https://example.com/bat.jpg" }],
  subtotal: 159.98,
  tax: 12.80,
  shippingCost: 15.00,
  total: 187.78,
  paymentMethod: "cod",
  currency: "USD",
  status: "pending",
  paymentStatus: "unpaid",
};

function mockPriceCalculation(overrides?: Record<string, unknown>) {
  vi.mocked(calculateOrderPrices).mockResolvedValue({
    items: [
      {
        productId: 1,
        productName: "Cricket Bat",
        productImage: "https://example.com/bat.jpg",
        quantity: 2,
        price: 79.99,
        total: 159.98,
      },
    ],
    subtotal: 159.98,
    tax: 12.80,
    taxRate: 0.08,
    shippingCost: 15.00,
    total: 187.78,
    ...overrides,
  } as any);
}

// ═════════════════════════════════════════════════════════════════
// GET /api/orders (admin only — list all orders)
// ═════════════════════════════════════════════════════════════════
describe("GET /api/orders", () => {
  beforeEach(() => resetDbMocks());

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await listOrders(
      createGET("http://localhost:3000/api/orders"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when not admin", async () => {
    mockCustomer();
    const res = await listOrders(
      createGET("http://localhost:3000/api/orders"),
    );
    expect(res.status).toBe(403);
  });

  it("returns paginated orders for admin", async () => {
    mockAdmin();
    const order = mockOrder();
    mockSelectResult([{ count: 1 }]); // count
    mockSelectResult([order]); // orders list

    const res = await listOrders(
      createGET("http://localhost:3000/api/orders"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orders).toHaveLength(1);
    expect(body.pagination.totalCount).toBe(1);
  });

  it("rejects invalid pagination params", async () => {
    mockAdmin();
    const res = await listOrders(
      createGET("http://localhost:3000/api/orders?page=0"),
    );
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════
// POST /api/orders (create order)
// ═════════════════════════════════════════════════════════════════
describe("POST /api/orders", () => {
  beforeEach(() => {
    resetDbMocks();
    vi.mocked(calculateOrderPrices).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await createOrder(
      createPOST("http://localhost:3000/api/orders", validOrderBody),
    );
    expect(res.status).toBe(401);
  });

  it("creates order successfully", async () => {
    mockCustomer();
    mockPriceCalculation();
    mockSelectResult([]); // no duplicate order number
    // Transaction: stock check SELECT per item, INSERT order, UPDATE stock per item
    const product = mockProduct({ stockQuantity: 50, trackInventory: true });
    mockSelectResult([product]); // stock check in tx
    const newOrder = mockOrder();
    mockInsertResult([newOrder]); // insert order in tx
    mockUpdateResult([]); // deduct stock in tx

    const res = await createOrder(
      createPOST("http://localhost:3000/api/orders", validOrderBody),
    );
    expect(res.status).toBe(201);
  });

  it("rejects order with insufficient stock", async () => {
    mockCustomer();
    mockPriceCalculation();
    mockSelectResult([]); // no duplicate order number
    // Transaction: stock check fails
    const product = mockProduct({ stockQuantity: 1, trackInventory: true, name: "Test Bat" });
    mockSelectResult([product]); // stock check — only 1 available, need 2

    // The transaction will throw because the handler checks stock
    const res = await createOrder(
      createPOST("http://localhost:3000/api/orders", validOrderBody),
    );
    // Should return a stock error (400 or 409)
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("rejects when price calculation fails (product not found)", async () => {
    mockCustomer();
    vi.mocked(calculateOrderPrices).mockResolvedValue({
      error: "Product not found: ID 999",
    } as any);

    const res = await createOrder(
      createPOST("http://localhost:3000/api/orders", validOrderBody),
    );
    expect(res.status).toBe(404);
  });

  it("rejects invalid order body (missing required fields)", async () => {
    mockCustomer();
    const res = await createOrder(
      createPOST("http://localhost:3000/api/orders", { items: [] }),
    );
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════
// GET /api/orders/[id]
// ═════════════════════════════════════════════════════════════════
describe("GET /api/orders/[id]", () => {
  beforeEach(() => resetDbMocks());

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await getOrder(
      createGET("http://localhost:3000/api/orders/1"),
      idParams("1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns order for its owner", async () => {
    mockCustomer(); // userId = "user-123"
    const order = mockOrder({ userId: "user-123" });
    mockSelectResult([order]);

    const res = await getOrder(
      createGET("http://localhost:3000/api/orders/1"),
      idParams("1"),
    );
    expect(res.status).toBe(200);
  });

  it("returns order for admin", async () => {
    mockAdmin();
    const order = mockOrder({ userId: "other-user" });
    mockSelectResult([order]);

    const res = await getOrder(
      createGET("http://localhost:3000/api/orders/1"),
      idParams("1"),
    );
    expect(res.status).toBe(200);
  });

  it("denies access to other user's order", async () => {
    mockCustomer(); // userId = "user-123"
    const order = mockOrder({ userId: "other-user", customerEmail: "other@test.com" });
    mockSelectResult([order]);

    const res = await getOrder(
      createGET("http://localhost:3000/api/orders/1"),
      idParams("1"),
    );
    expect(res.status).toBe(403);
  });

  it("returns 404 for non-existent order", async () => {
    mockCustomer();
    mockSelectResult([]);

    const res = await getOrder(
      createGET("http://localhost:3000/api/orders/999"),
      idParams("999"),
    );
    expect(res.status).toBe(404);
  });

  it("rejects invalid order ID", async () => {
    mockCustomer();
    const res = await getOrder(
      createGET("http://localhost:3000/api/orders/abc"),
      idParams("abc"),
    );
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════
// PUT /api/orders/[id] (admin only)
// ═════════════════════════════════════════════════════════════════
describe("PUT /api/orders/[id]", () => {
  beforeEach(() => resetDbMocks());

  it("returns 403 when not admin", async () => {
    mockCustomer();
    const res = await updateOrder(
      createPUT("http://localhost:3000/api/orders/1", { status: "processing" }),
      idParams("1"),
    );
    expect(res.status).toBe(403);
  });

  it("updates order status", async () => {
    mockAdmin();
    const updated = mockOrder({ status: "processing" });
    mockUpdateResult([updated]);

    const res = await updateOrder(
      createPUT("http://localhost:3000/api/orders/1", { status: "processing" }),
      idParams("1"),
    );
    expect(res.status).toBe(200);
  });

  it("returns 404 for non-existent order", async () => {
    mockAdmin();
    mockUpdateResult([]);

    const res = await updateOrder(
      createPUT("http://localhost:3000/api/orders/999", { status: "processing" }),
      idParams("999"),
    );
    expect(res.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════
// DELETE /api/orders/[id] (admin only — soft delete)
// ═════════════════════════════════════════════════════════════════
describe("DELETE /api/orders/[id]", () => {
  beforeEach(() => resetDbMocks());

  it("returns 403 when not admin", async () => {
    mockCustomer();
    const res = await deleteOrder(
      createDELETE("http://localhost:3000/api/orders/1"),
      idParams("1"),
    );
    expect(res.status).toBe(403);
  });

  it("soft-deletes pending order and restores stock", async () => {
    mockAdmin();
    const order = mockOrder({ status: "pending", paymentStatus: "unpaid" });
    mockSelectResult([order]); // get order
    // Restore stock: select product for each item
    const product = mockProduct({ stockQuantity: 48, trackInventory: true });
    mockSelectResult([product]);
    // Stock update uses .set().where() without .returning() — doesn't consume update queue
    // Soft-delete update uses .returning() — consumes from update queue
    const deleted = mockOrder({ id: 1, orderNumber: "ORD-2025-000001", deletedAt: "2025-01-01T00:00:00.000Z" });
    mockUpdateResult([deleted]);

    const res = await deleteOrder(
      createDELETE("http://localhost:3000/api/orders/1"),
      idParams("1"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.stockRestored).toBe(true);
  });

  it("rejects deleting delivered + paid order", async () => {
    mockAdmin();
    const order = mockOrder({ status: "delivered", paymentStatus: "paid" });
    mockSelectResult([order]);

    const res = await deleteOrder(
      createDELETE("http://localhost:3000/api/orders/1"),
      idParams("1"),
    );
    expect(res.status).toBe(422);
  });

  it("returns 404 for non-existent order", async () => {
    mockAdmin();
    mockSelectResult([]); // order not found

    const res = await deleteOrder(
      createDELETE("http://localhost:3000/api/orders/999"),
      idParams("999"),
    );
    expect(res.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════
// GET /api/orders/my-orders
// ═════════════════════════════════════════════════════════════════
describe("GET /api/orders/my-orders", () => {
  beforeEach(() => resetDbMocks());

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await getMyOrders(
      createGET("http://localhost:3000/api/orders/my-orders"),
    );
    expect(res.status).toBe(401);
  });

  it("returns user's own orders", async () => {
    mockCustomer();
    const order = mockOrder({ userId: "user-123" });
    mockSelectResult([order]);

    const res = await getMyOrders(
      createGET("http://localhost:3000/api/orders/my-orders"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orders).toHaveLength(1);
    expect(body.count).toBe(1);
  });

  it("returns empty when user has no orders", async () => {
    mockCustomer();
    mockSelectResult([]);

    const res = await getMyOrders(
      createGET("http://localhost:3000/api/orders/my-orders"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orders).toHaveLength(0);
    expect(body.count).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════
// POST /api/orders/[id]/cancel
// ═════════════════════════════════════════════════════════════════
describe("POST /api/orders/[id]/cancel", () => {
  beforeEach(() => resetDbMocks());

  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await cancelOrder(
      createPOST("http://localhost:3000/api/orders/1/cancel"),
      idParams("1"),
    );
    expect(res.status).toBe(401);
  });

  it("cancels pending order and restores inventory", async () => {
    mockCustomer();
    const order = mockOrder({ status: "pending", userId: "user-123" });
    mockSelectResult([order]); // get order
    // Restore inventory: select product then update
    const product = mockProduct({ stockQuantity: 48, trackInventory: true });
    mockSelectResult([product]);
    mockUpdateResult([]); // restore stock
    // Update order status
    const cancelled = mockOrder({ status: "cancelled" });
    mockUpdateResult([cancelled]);

    const res = await cancelOrder(
      createPOST("http://localhost:3000/api/orders/1/cancel"),
      idParams("1"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.inventoryRestored).toBe(true);
  });

  it("denies cancelling other user's order", async () => {
    mockCustomer(); // userId = "user-123"
    const order = mockOrder({ status: "pending", userId: "other-user", customerEmail: "other@test.com" });
    mockSelectResult([order]);

    const res = await cancelOrder(
      createPOST("http://localhost:3000/api/orders/1/cancel"),
      idParams("1"),
    );
    expect(res.status).toBe(403);
  });

  it("allows admin to cancel any order", async () => {
    mockAdmin();
    const order = mockOrder({ status: "pending", userId: "other-user" });
    mockSelectResult([order]);
    const product = mockProduct({ stockQuantity: 48, trackInventory: true });
    mockSelectResult([product]);
    mockUpdateResult([]); // restore stock
    const cancelled = mockOrder({ status: "cancelled" });
    mockUpdateResult([cancelled]);

    const res = await cancelOrder(
      createPOST("http://localhost:3000/api/orders/1/cancel"),
      idParams("1"),
    );
    expect(res.status).toBe(200);
  });

  it("rejects cancelling shipped order", async () => {
    mockCustomer();
    const order = mockOrder({ status: "shipped", userId: "user-123" });
    mockSelectResult([order]);

    const res = await cancelOrder(
      createPOST("http://localhost:3000/api/orders/1/cancel"),
      idParams("1"),
    );
    expect(res.status).toBe(422);
  });

  it("returns 404 for non-existent order", async () => {
    mockCustomer();
    mockSelectResult([]);

    const res = await cancelOrder(
      createPOST("http://localhost:3000/api/orders/999/cancel"),
      idParams("999"),
    );
    expect(res.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════
// POST /api/orders/[id]/refund (admin only)
// ═════════════════════════════════════════════════════════════════
describe("POST /api/orders/[id]/refund", () => {
  beforeEach(() => resetDbMocks());

  it("returns 403 when not admin", async () => {
    mockCustomer();
    const res = await refundOrder(
      createPOST("http://localhost:3000/api/orders/1/refund", {
        reason: "Customer requested refund for defective item",
      }),
      idParams("1"),
    );
    expect(res.status).toBe(403);
  });

  it("processes refund for paid order", async () => {
    mockAdmin();
    const order = mockOrder({ status: "delivered", paymentStatus: "paid", total: "187.78" });
    mockSelectResult([order]); // get order
    // Restore inventory: select product then update
    const product = mockProduct({ stockQuantity: 48, trackInventory: true });
    mockSelectResult([product]);
    mockUpdateResult([]); // restore stock
    // Update order status
    const refunded = mockOrder({ status: "refunded", paymentStatus: "refunded" });
    mockUpdateResult([refunded]);

    const res = await refundOrder(
      createPOST("http://localhost:3000/api/orders/1/refund", {
        reason: "Customer requested refund for defective item",
      }),
      idParams("1"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.inventoryRestored).toBe(true);
  });

  it("rejects refund for already refunded order", async () => {
    mockAdmin();
    const order = mockOrder({ paymentStatus: "refunded" });
    mockSelectResult([order]);

    const res = await refundOrder(
      createPOST("http://localhost:3000/api/orders/1/refund", {
        reason: "Customer requested another refund",
      }),
      idParams("1"),
    );
    expect(res.status).toBe(409);
  });

  it("rejects refund for unpaid order", async () => {
    mockAdmin();
    const order = mockOrder({ paymentStatus: "unpaid" });
    mockSelectResult([order]);

    const res = await refundOrder(
      createPOST("http://localhost:3000/api/orders/1/refund", {
        reason: "Trying to refund unpaid order",
      }),
      idParams("1"),
    );
    expect(res.status).toBe(422);
  });

  it("rejects refund amount exceeding order total", async () => {
    mockAdmin();
    const order = mockOrder({ paymentStatus: "paid", total: "100.00" });
    mockSelectResult([order]);

    const res = await refundOrder(
      createPOST("http://localhost:3000/api/orders/1/refund", {
        reason: "Excessive refund attempt test reason",
        refundAmount: 200.00,
      }),
      idParams("1"),
    );
    expect(res.status).toBe(400);
  });

  it("rejects short refund reason", async () => {
    mockAdmin();
    const res = await refundOrder(
      createPOST("http://localhost:3000/api/orders/1/refund", {
        reason: "short",
      }),
      idParams("1"),
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent order", async () => {
    mockAdmin();
    mockSelectResult([]);

    const res = await refundOrder(
      createPOST("http://localhost:3000/api/orders/999/refund", {
        reason: "Refund for non-existent order test",
      }),
      idParams("999"),
    );
    expect(res.status).toBe(404);
  });
});
