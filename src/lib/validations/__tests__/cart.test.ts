import { describe, it, expect } from "vitest";
import {
  cartItemSchema,
  updateCartSchema,
  updateCartItemSchema,
  MAX_CART_ITEMS,
  MAX_ITEM_QUANTITY,
  MIN_ITEM_QUANTITY,
} from "@/lib/validations/cart";

describe("cartItemSchema", () => {
  it("accepts valid cart item", () => {
    const result = cartItemSchema.safeParse({ productId: 1, quantity: 3 });
    expect(result.success).toBe(true);
  });

  it("rejects zero quantity", () => {
    expect(cartItemSchema.safeParse({ productId: 1, quantity: 0 }).success).toBe(false);
  });

  it("rejects quantity exceeding max", () => {
    expect(
      cartItemSchema.safeParse({ productId: 1, quantity: MAX_ITEM_QUANTITY + 1 }).success
    ).toBe(false);
  });

  it("rejects negative product id", () => {
    expect(cartItemSchema.safeParse({ productId: -1, quantity: 1 }).success).toBe(false);
  });

  it("rejects non-integer quantity", () => {
    expect(cartItemSchema.safeParse({ productId: 1, quantity: 1.5 }).success).toBe(false);
  });
});

describe("updateCartSchema", () => {
  it("accepts valid cart", () => {
    const result = updateCartSchema.safeParse({
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("defaults to empty items", () => {
    const result = updateCartSchema.parse({});
    expect(result.items).toEqual([]);
  });

  it("rejects too many items", () => {
    const items = Array.from({ length: MAX_CART_ITEMS + 1 }, (_, i) => ({
      productId: i + 1,
      quantity: 1,
    }));
    expect(updateCartSchema.safeParse({ items }).success).toBe(false);
  });
});

describe("updateCartItemSchema", () => {
  it("accepts quantity 0 (remove item)", () => {
    const result = updateCartItemSchema.safeParse({ productId: 1, quantity: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects negative quantity", () => {
    expect(
      updateCartItemSchema.safeParse({ productId: 1, quantity: -1 }).success
    ).toBe(false);
  });
});

describe("cart constants", () => {
  it("has sensible limits", () => {
    expect(MAX_CART_ITEMS).toBe(50);
    expect(MAX_ITEM_QUANTITY).toBe(99);
    expect(MIN_ITEM_QUANTITY).toBe(1);
  });
});
