import { describe, it, expect } from "vitest";
import {
  TAX_RATE,
  TAX_LABEL,
  SHIPPING_COST,
  CURRENCY,
  SHIPPING_COUNTRY,
  PAYMENT_METHOD,
} from "@/lib/constants";

describe("business constants", () => {
  it("TAX_RATE is 8%", () => {
    expect(TAX_RATE).toBe(0.08);
  });

  it("TAX_LABEL matches TAX_RATE", () => {
    expect(TAX_LABEL).toContain("8%");
  });

  it("SHIPPING_COST is a positive number", () => {
    expect(SHIPPING_COST).toBeGreaterThan(0);
    expect(SHIPPING_COST).toBe(15);
  });

  it("CURRENCY is USD", () => {
    expect(CURRENCY).toBe("USD");
  });

  it("SHIPPING_COUNTRY is USA", () => {
    expect(SHIPPING_COUNTRY).toBe("USA");
  });

  it("PAYMENT_METHOD is cod", () => {
    expect(PAYMENT_METHOD).toBe("cod");
  });
});
