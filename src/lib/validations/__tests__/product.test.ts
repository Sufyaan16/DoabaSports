import { describe, it, expect } from "vitest";
import { createProductSchema, updateProductSchema, productQuerySchema } from "@/lib/validations/product";

const validProduct = {
  name: "Cricket Bat Pro",
  company: "Doaba Sports",
  category: "cricket-bats",
  description: "A high-quality cricket bat for professional play",
  priceRegular: 149.99,
  priceCurrency: "USD" as const,
  imageSrc: "https://images.unsplash.com/photo.jpg",
  imageAlt: "Cricket bat product image",
  stockQuantity: 50,
  lowStockThreshold: 10,
  trackInventory: true,
};

describe("createProductSchema", () => {
  it("accepts a valid product", () => {
    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("accepts product with sale price less than regular", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      priceSale: 99.99,
    });
    expect(result.success).toBe(true);
  });

  it("rejects sale price >= regular price", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      priceSale: 149.99,
    });
    expect(result.success).toBe(false);
  });

  it("rejects sale price greater than regular price", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      priceSale: 200,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createProductSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(false);
  });

  it("rejects name too short", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description too short", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      description: "Short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid image URL", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      imageSrc: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative stock quantity", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      stockQuantity: -5,
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields as null", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      imageHoverSrc: null,
      imageHoverAlt: null,
      badgeText: null,
      sku: null,
    });
    expect(result.success).toBe(true);
  });

  it("validates badge color format", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      badgeBackgroundColor: "red", // not hex
    });
    expect(result.success).toBe(false);

    const validBadge = createProductSchema.safeParse({
      ...validProduct,
      badgeBackgroundColor: "#FF5733",
    });
    expect(validBadge.success).toBe(true);
  });
});

describe("updateProductSchema", () => {
  it("accepts partial updates", () => {
    const result = updateProductSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (no changes)", () => {
    const result = updateProductSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates fields that are provided", () => {
    const result = updateProductSchema.safeParse({ priceRegular: -5 });
    expect(result.success).toBe(false);
  });
});

describe("productQuerySchema", () => {
  it("applies defaults", () => {
    const result = productQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.sortBy).toBe("newest");
  });

  it("accepts all valid sort options", () => {
    for (const sort of ["newest", "price-low", "price-high", "name-asc", "name-desc"]) {
      const result = productQuerySchema.safeParse({ sortBy: sort });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid sort option", () => {
    const result = productQuerySchema.safeParse({ sortBy: "random" });
    expect(result.success).toBe(false);
  });

  it("accepts valid filters", () => {
    const result = productQuerySchema.safeParse({
      category: "cricket-bats",
      minPrice: 10,
      maxPrice: 200,
      search: "bat",
      page: "2",
      limit: "20",
    });
    expect(result.success).toBe(true);
  });
});
