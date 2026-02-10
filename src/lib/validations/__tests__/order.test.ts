import { describe, it, expect } from "vitest";
import {
  orderItemSchema,
  orderNumberSchema,
  orderStatusSchema,
  paymentStatusSchema,
  paymentMethodSchema,
  createOrderSchema,
  updateOrderSchema,
} from "@/lib/validations/order";

describe("orderItemSchema", () => {
  it("accepts valid item", () => {
    const result = orderItemSchema.safeParse({
      productId: 1,
      productName: "Cricket Bat",
      productImage: "https://example.com/bat.jpg",
      quantity: 2,
      price: 49.99,
      total: 99.98,
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero quantity", () => {
    const result = orderItemSchema.safeParse({
      productId: 1,
      productName: "Bat",
      productImage: "https://example.com/bat.jpg",
      quantity: 0,
      price: 49.99,
      total: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid image URL", () => {
    const result = orderItemSchema.safeParse({
      productId: 1,
      productName: "Bat",
      productImage: "not-a-url",
      quantity: 1,
      price: 49.99,
      total: 49.99,
    });
    expect(result.success).toBe(false);
  });
});

describe("orderNumberSchema", () => {
  it("accepts valid format", () => {
    expect(orderNumberSchema.safeParse("ORD-2026-123456").success).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(orderNumberSchema.safeParse("ORDER-123").success).toBe(false);
    expect(orderNumberSchema.safeParse("ORD-2026-12345").success).toBe(false); // 5 digits instead of 6
    expect(orderNumberSchema.safeParse("").success).toBe(false);
  });
});

describe("orderStatusSchema", () => {
  it("accepts all valid statuses", () => {
    for (const status of ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]) {
      expect(orderStatusSchema.safeParse(status).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(orderStatusSchema.safeParse("completed").success).toBe(false);
  });
});

describe("paymentStatusSchema", () => {
  it("accepts all valid statuses", () => {
    for (const status of ["unpaid", "paid", "refunded", "failed"]) {
      expect(paymentStatusSchema.safeParse(status).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(paymentStatusSchema.safeParse("pending").success).toBe(false);
  });
});

describe("paymentMethodSchema", () => {
  it("accepts all valid methods", () => {
    for (const method of ["credit_card", "debit_card", "paypal", "cod", "stripe"]) {
      expect(paymentMethodSchema.safeParse(method).success).toBe(true);
    }
  });

  it("rejects invalid method", () => {
    expect(paymentMethodSchema.safeParse("bitcoin").success).toBe(false);
  });
});

describe("createOrderSchema", () => {
  const validOrder = {
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+14155551234",
    shippingAddress: "123 Main Street",
    shippingCity: "New York",
    shippingState: "NY",
    shippingZip: "10001",
    shippingCountry: "USA",
    items: [
      {
        productId: 1,
        productName: "Cricket Bat",
        productImage: "https://example.com/bat.jpg",
        quantity: 2,
        price: 49.99,
        total: 99.98,
      },
    ],
    subtotal: 99.98,
    tax: 8,
    shippingCost: 15,
    total: 122.98,
    currency: "USD",
    paymentMethod: "cod",
  };

  it("accepts valid order", () => {
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it("applies default status", () => {
    const result = createOrderSchema.parse(validOrder);
    expect(result.status).toBe("pending");
    expect(result.paymentStatus).toBe("unpaid");
  });

  it("rejects empty items array", () => {
    const result = createOrderSchema.safeParse({ ...validOrder, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects missing customer info", () => {
    const { customerName, ...noName } = validOrder;
    expect(createOrderSchema.safeParse(noName).success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      customerEmail: "not-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid zip code", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      shippingZip: "ABC",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateOrderSchema", () => {
  it("accepts partial updates", () => {
    expect(updateOrderSchema.safeParse({ status: "shipped" }).success).toBe(true);
    expect(updateOrderSchema.safeParse({ trackingNumber: "TRK123" }).success).toBe(true);
  });

  it("accepts empty object", () => {
    expect(updateOrderSchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(updateOrderSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });
});
