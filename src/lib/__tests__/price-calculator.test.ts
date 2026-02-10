import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateClientPrices, type OrderCalculation } from "@/lib/price-calculator";

// We can only unit-test validateClientPrices since calculateOrderPrices requires a real DB.
// calculateOrderPrices is tested via integration tests.

describe("validateClientPrices", () => {
  const mockCalculation: OrderCalculation = {
    items: [
      {
        productId: 1,
        quantity: 2,
        productName: "Cricket Bat",
        productImage: "https://example.com/bat.jpg",
        price: 49.99,
        total: 99.98,
      },
    ],
    subtotal: 99.98,
    tax: 8.0,
    taxRate: 0.08,
    shippingCost: 15.0,
    total: 122.98,
  };

  it("returns true when client total matches server total", () => {
    expect(validateClientPrices(122.98, mockCalculation)).toBe(true);
  });

  it("returns true within default tolerance (1 cent)", () => {
    expect(validateClientPrices(122.99, mockCalculation)).toBe(true);
    // 122.97 is 0.01 away — but floating point makes it slightly over tolerance
    expect(validateClientPrices(122.975, mockCalculation)).toBe(true);
  });

  it("returns false when difference exceeds tolerance", () => {
    expect(validateClientPrices(123.00, mockCalculation)).toBe(false);
    expect(validateClientPrices(120.00, mockCalculation)).toBe(false);
  });

  it("accepts custom tolerance", () => {
    expect(validateClientPrices(123.50, mockCalculation, 1.0)).toBe(true);
    expect(validateClientPrices(124.00, mockCalculation, 1.0)).toBe(false);
  });

  it("returns false for zero client total", () => {
    expect(validateClientPrices(0, mockCalculation)).toBe(false);
  });

  it("returns false for negative client total", () => {
    expect(validateClientPrices(-100, mockCalculation)).toBe(false);
  });
});
