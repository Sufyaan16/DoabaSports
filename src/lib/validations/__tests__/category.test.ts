import { describe, it, expect } from "vitest";
import { createCategorySchema, updateCategorySchema, categorySlugSchema } from "@/lib/validations/category";

const validCategory = {
  slug: "cricket-bats",
  name: "Cricket Bats",
  description: "High quality cricket bats for all levels",
  longDescription: "Our cricket bats are crafted from the finest English willow and Kashmir willow.",
  image: "https://images.unsplash.com/photo.jpg",
};

describe("createCategorySchema", () => {
  it("accepts valid category", () => {
    expect(createCategorySchema.safeParse(validCategory).success).toBe(true);
  });

  it("accepts with optional imageHover", () => {
    const result = createCategorySchema.safeParse({
      ...validCategory,
      imageHover: "https://images.unsplash.com/hover.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug", () => {
    expect(
      createCategorySchema.safeParse({ ...validCategory, slug: "INVALID SLUG" }).success
    ).toBe(false);
  });

  it("rejects short description", () => {
    expect(
      createCategorySchema.safeParse({ ...validCategory, description: "Short" }).success
    ).toBe(false);
  });

  it("rejects short longDescription", () => {
    expect(
      createCategorySchema.safeParse({ ...validCategory, longDescription: "Too short" }).success
    ).toBe(false);
  });

  it("rejects invalid image URL", () => {
    expect(
      createCategorySchema.safeParse({ ...validCategory, image: "not-a-url" }).success
    ).toBe(false);
  });
});

describe("updateCategorySchema", () => {
  it("accepts partial updates", () => {
    expect(updateCategorySchema.safeParse({ name: "New Name" }).success).toBe(true);
  });

  it("accepts empty object", () => {
    expect(updateCategorySchema.safeParse({}).success).toBe(true);
  });
});

describe("categorySlugSchema", () => {
  it("accepts valid slugs", () => {
    expect(categorySlugSchema.safeParse("cricket-bats").success).toBe(true);
    expect(categorySlugSchema.safeParse("accessories").success).toBe(true);
  });

  it("rejects invalid slugs", () => {
    expect(categorySlugSchema.safeParse("A").success).toBe(false);
    expect(categorySlugSchema.safeParse("UPPER").success).toBe(false);
  });
});
