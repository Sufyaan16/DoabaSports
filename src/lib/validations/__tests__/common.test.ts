import { describe, it, expect } from "vitest";
import {
  emailSchema,
  phoneSchema,
  nameSchema,
  addressSchema,
  citySchema,
  stateSchema,
  zipCodeSchema,
  currencySchema,
  positiveNumberSchema,
  priceSchema,
  idSchema,
  slugSchema,
  pageSchema,
  limitSchema,
  searchQuerySchema,
} from "@/lib/validations/common";

describe("emailSchema", () => {
  it("accepts valid emails", () => {
    expect(emailSchema.safeParse("test@example.com").success).toBe(true);
    expect(emailSchema.safeParse("user+tag@domain.co").success).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse("@domain.com").success).toBe(false);
  });
});

describe("phoneSchema", () => {
  it("accepts valid phone numbers", () => {
    expect(phoneSchema.safeParse("+14155551234").success).toBe(true);
    expect(phoneSchema.safeParse("14155551234").success).toBe(true);
  });

  it("accepts empty string (optional)", () => {
    expect(phoneSchema.safeParse("").success).toBe(true);
  });

  it("accepts undefined (optional)", () => {
    expect(phoneSchema.safeParse(undefined).success).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(phoneSchema.safeParse("abc").success).toBe(false);
    expect(phoneSchema.safeParse("+0123").success).toBe(false);
  });
});

describe("nameSchema", () => {
  it("accepts valid names", () => {
    expect(nameSchema.safeParse("John").success).toBe(true);
    expect(nameSchema.safeParse("Jane Doe").success).toBe(true);
  });

  it("rejects too short", () => {
    expect(nameSchema.safeParse("J").success).toBe(false);
    expect(nameSchema.safeParse("").success).toBe(false);
  });

  it("rejects too long", () => {
    expect(nameSchema.safeParse("A".repeat(101)).success).toBe(false);
  });
});

describe("addressSchema", () => {
  it("accepts valid addresses", () => {
    expect(addressSchema.safeParse("123 Main Street").success).toBe(true);
  });

  it("rejects too short", () => {
    expect(addressSchema.safeParse("123").success).toBe(false);
  });

  it("rejects too long", () => {
    expect(addressSchema.safeParse("A".repeat(201)).success).toBe(false);
  });
});

describe("zipCodeSchema", () => {
  it("accepts 5-digit zip", () => {
    expect(zipCodeSchema.safeParse("12345").success).toBe(true);
  });

  it("accepts zip+4", () => {
    expect(zipCodeSchema.safeParse("12345-6789").success).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(zipCodeSchema.safeParse("1234").success).toBe(false);
    expect(zipCodeSchema.safeParse("ABCDE").success).toBe(false);
    expect(zipCodeSchema.safeParse("123456").success).toBe(false);
  });
});

describe("currencySchema", () => {
  it("accepts valid currencies", () => {
    expect(currencySchema.safeParse("USD").success).toBe(true);
    expect(currencySchema.safeParse("EUR").success).toBe(true);
    expect(currencySchema.safeParse("GBP").success).toBe(true);
    expect(currencySchema.safeParse("CAD").success).toBe(true);
  });

  it("rejects invalid currencies", () => {
    expect(currencySchema.safeParse("PKR").success).toBe(false);
    expect(currencySchema.safeParse("").success).toBe(false);
  });
});

describe("priceSchema", () => {
  it("accepts valid prices", () => {
    expect(priceSchema.safeParse(9.99).success).toBe(true);
    expect(priceSchema.safeParse(100).success).toBe(true);
    expect(priceSchema.safeParse(0.01).success).toBe(true);
  });

  it("rejects zero and negative", () => {
    expect(priceSchema.safeParse(0).success).toBe(false);
    expect(priceSchema.safeParse(-5).success).toBe(false);
  });

  it("rejects too many decimal places", () => {
    expect(priceSchema.safeParse(9.999).success).toBe(false);
  });
});

describe("idSchema", () => {
  it("accepts positive integers", () => {
    expect(idSchema.safeParse(1).success).toBe(true);
    expect(idSchema.safeParse("42").success).toBe(true); // coerces strings
  });

  it("rejects non-positive", () => {
    expect(idSchema.safeParse(0).success).toBe(false);
    expect(idSchema.safeParse(-1).success).toBe(false);
  });

  it("rejects non-integers", () => {
    expect(idSchema.safeParse(1.5).success).toBe(false);
  });
});

describe("slugSchema", () => {
  it("accepts valid slugs", () => {
    expect(slugSchema.safeParse("cricket-bats").success).toBe(true);
    expect(slugSchema.safeParse("accessories").success).toBe(true);
    expect(slugSchema.safeParse("a1-b2-c3").success).toBe(true);
  });

  it("rejects invalid slugs", () => {
    expect(slugSchema.safeParse("").success).toBe(false);
    expect(slugSchema.safeParse("UPPER-CASE").success).toBe(false);
    expect(slugSchema.safeParse("has spaces").success).toBe(false);
    expect(slugSchema.safeParse("-leading-hyphen").success).toBe(false);
    expect(slugSchema.safeParse("trailing-hyphen-").success).toBe(false);
  });
});

describe("pageSchema", () => {
  it("defaults to 1", () => {
    expect(pageSchema.parse(undefined)).toBe(1);
  });

  it("accepts valid pages", () => {
    expect(pageSchema.parse("5")).toBe(5);
    expect(pageSchema.parse(10)).toBe(10);
  });

  it("rejects zero and negative", () => {
    expect(pageSchema.safeParse(0).success).toBe(false);
    expect(pageSchema.safeParse(-1).success).toBe(false);
  });
});

describe("limitSchema", () => {
  it("defaults to 10", () => {
    expect(limitSchema.parse(undefined)).toBe(10);
  });

  it("accepts valid limits", () => {
    expect(limitSchema.parse("50")).toBe(50);
    expect(limitSchema.parse(100)).toBe(100);
  });

  it("rejects out-of-range", () => {
    expect(limitSchema.safeParse(0).success).toBe(false);
    expect(limitSchema.safeParse(101).success).toBe(false);
  });
});

describe("searchQuerySchema", () => {
  it("accepts valid queries", () => {
    expect(searchQuerySchema.safeParse("cricket bat").success).toBe(true);
    expect(searchQuerySchema.safeParse(undefined).success).toBe(true);
  });

  it("rejects too long", () => {
    expect(searchQuerySchema.safeParse("A".repeat(201)).success).toBe(false);
  });
});
