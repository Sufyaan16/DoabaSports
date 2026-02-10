import { describe, it, expect } from "vitest";
import { userRoleSchema, userMetadataSchema, updateUserMetadataSchema } from "@/lib/validations/user";

describe("userRoleSchema", () => {
  it("accepts customer", () => {
    expect(userRoleSchema.safeParse("customer").success).toBe(true);
  });

  it("accepts admin", () => {
    expect(userRoleSchema.safeParse("admin").success).toBe(true);
  });

  it("rejects invalid roles", () => {
    expect(userRoleSchema.safeParse("superadmin").success).toBe(false);
    expect(userRoleSchema.safeParse("").success).toBe(false);
  });
});

describe("userMetadataSchema", () => {
  it("accepts valid metadata", () => {
    const result = userMetadataSchema.safeParse({
      role: "admin",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing role", () => {
    const result = userMetadataSchema.safeParse({
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid datetime", () => {
    const result = userMetadataSchema.safeParse({
      role: "customer",
      createdAt: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateUserMetadataSchema", () => {
  it("accepts partial updates", () => {
    expect(updateUserMetadataSchema.safeParse({ role: "admin" }).success).toBe(true);
    expect(updateUserMetadataSchema.safeParse({}).success).toBe(true);
  });
});
