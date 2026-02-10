/**
 * Test helpers for API integration tests.
 * Provides mock factories for auth, DB, and rate limiting.
 *
 * NOTE: The test file that imports this must have vi.mock("@/stack/server") 
 * hoisted (inline vi.mock at top level) so this import resolves to the mock.
 */
import { vi } from "vitest";
import { NextRequest } from "next/server";
// This import resolves to the mock because vi.mock is hoisted in the test file
import { stackServerApp } from "@/stack/server";

// ─── Auth Mock Helpers ───────────────────────────────────────────

export type MockUser = {
  id: string;
  clientReadOnlyMetadata: { role: string; createdAt?: string } | string | null;
  primaryEmail?: string;
  updateClientReadOnlyMetadata?: ReturnType<typeof vi.fn>;
};

const defaultUser: MockUser = {
  id: "user-123",
  clientReadOnlyMetadata: { role: "customer" },
  primaryEmail: "test@example.com",
};

const adminUser: MockUser = {
  id: "admin-456",
  clientReadOnlyMetadata: { role: "admin" },
  primaryEmail: "admin@example.com",
};

/** Set mock auth to return a specific user (or null for unauthenticated) */
export function mockAuthUser(user: MockUser | null = defaultUser) {
  vi.mocked(stackServerApp.getUser).mockResolvedValue(user as any);
}

/** Shortcut for authenticated customer */
export function mockCustomer(overrides?: Partial<MockUser>) {
  mockAuthUser({ ...defaultUser, ...overrides });
}

/** Shortcut for authenticated admin */
export function mockAdmin(overrides?: Partial<MockUser>) {
  mockAuthUser({ ...adminUser, ...overrides });
}

/** Shortcut for unauthenticated */
export function mockUnauthenticated() {
  mockAuthUser(null);
}

// ─── Request Factories ──────────────────────────────────────────

export function createRequest(
  method: string,
  url = "http://localhost:3000/api/test",
  body?: unknown,
): NextRequest {
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  return new NextRequest(url, init as any);
}

export function createGET(url?: string): NextRequest {
  return createRequest("GET", url);
}

export function createPOST(url?: string, body?: unknown): NextRequest {
  return createRequest("POST", url, body);
}

export function createPUT(url?: string, body?: unknown): NextRequest {
  return createRequest("PUT", url, body);
}

export function createDELETE(url?: string): NextRequest {
  return createRequest("DELETE", url);
}

// ─── Response Helpers ───────────────────────────────────────────

export async function parseJSON(response: Response): Promise<unknown> {
  return response.json();
}

export async function expectStatus(response: Response, status: number) {
  if (response.status !== status) {
    const body = await response.clone().text();
    throw new Error(
      `Expected status ${status}, got ${response.status}. Body: ${body}`,
    );
  }
}

export async function expectError(
  response: Response,
  status: number,
  errorCode?: string,
) {
  await expectStatus(response, status);
  const body = (await parseJSON(response)) as any;
  if (errorCode && body.error?.code !== errorCode) {
    throw new Error(
      `Expected error code "${errorCode}", got "${body.error?.code}"`,
    );
  }
  return body;
}

// ─── Mock Data Factories ────────────────────────────────────────

export const mockProduct = (overrides?: Record<string, unknown>) => ({
  id: 1,
  name: "Cricket Bat",
  company: "Doaba Sports",
  category: "cricketbats",
  description: "A high quality cricket bat made from English Willow",
  priceRegular: "99.99",
  priceSale: "79.99",
  priceCurrency: "USD",
  imageSrc: "https://example.com/bat.jpg",
  imageAlt: "Cricket Bat",
  imageHoverSrc: null,
  sku: "BAT-001",
  stockQuantity: 50,
  lowStockThreshold: 10,
  trackInventory: true,
  badgeText: null,
  badgeBackgroundColor: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  ...overrides,
});

export const mockCategory = (overrides?: Record<string, unknown>) => ({
  id: 1,
  slug: "cricketbats",
  name: "Cricket Bats",
  description: "High quality cricket bats for professionals",
  longDescription:
    "Our cricket bats are made from the finest English Willow and Kashmir Willow",
  image: "https://example.com/category.jpg",
  imageHover: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  ...overrides,
});

export const mockCart = (overrides?: Record<string, unknown>) => ({
  id: 1,
  userId: "user-123",
  items: [{ productId: 1, quantity: 2 }],
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  ...overrides,
});

export const mockOrder = (overrides?: Record<string, unknown>) => ({
  id: 1,
  orderNumber: "ORD-2025-000001",
  userId: "user-123",
  customerName: "John Doe",
  customerEmail: "test@example.com",
  customerPhone: "+15551234567",
  shippingAddress: "123 Main St",
  shippingCity: "New York",
  shippingState: "NY",
  shippingZip: "10001",
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
  subtotal: "159.98",
  tax: "12.80",
  shippingCost: "15.00",
  total: "187.78",
  status: "pending",
  paymentStatus: "unpaid",
  paymentMethod: "cod",
  currency: "USD",
  trackingNumber: null,
  notes: null,
  deletedAt: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  ...overrides,
});

export const mockWishlistItem = (overrides?: Record<string, unknown>) => ({
  id: 1,
  userId: "user-123",
  productId: 1,
  addedAt: "2025-01-01T00:00:00.000Z",
  notes: null,
  ...overrides,
});
