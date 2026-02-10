import { describe, it, expect } from "vitest";
import { ErrorCode, ErrorStatusCode, ErrorMessage } from "@/lib/errors/error-codes";

describe("ErrorCode enum", () => {
  it("has all expected auth codes", () => {
    expect(ErrorCode.AUTH_REQUIRED).toBe("AUTH_REQUIRED");
    expect(ErrorCode.AUTH_ADMIN_REQUIRED).toBe("AUTH_ADMIN_REQUIRED");
    expect(ErrorCode.AUTH_INVALID_TOKEN).toBe("AUTH_INVALID_TOKEN");
  });

  it("has all expected resource codes", () => {
    expect(ErrorCode.PRODUCT_NOT_FOUND).toBe("PRODUCT_NOT_FOUND");
    expect(ErrorCode.ORDER_NOT_FOUND).toBe("ORDER_NOT_FOUND");
    expect(ErrorCode.CATEGORY_NOT_FOUND).toBe("CATEGORY_NOT_FOUND");
  });

  it("has rate limit codes", () => {
    expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe("RATE_LIMIT_EXCEEDED");
    expect(ErrorCode.TOO_MANY_REQUESTS).toBe("TOO_MANY_REQUESTS");
  });
});

describe("ErrorStatusCode mapping", () => {
  it("maps auth errors to 401/403", () => {
    expect(ErrorStatusCode[ErrorCode.AUTH_REQUIRED]).toBe(401);
    expect(ErrorStatusCode[ErrorCode.AUTH_ADMIN_REQUIRED]).toBe(403);
    expect(ErrorStatusCode[ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]).toBe(403);
  });

  it("maps not-found errors to 404", () => {
    expect(ErrorStatusCode[ErrorCode.PRODUCT_NOT_FOUND]).toBe(404);
    expect(ErrorStatusCode[ErrorCode.ORDER_NOT_FOUND]).toBe(404);
    expect(ErrorStatusCode[ErrorCode.CATEGORY_NOT_FOUND]).toBe(404);
  });

  it("maps validation errors to 400", () => {
    expect(ErrorStatusCode[ErrorCode.VALIDATION_FAILED]).toBe(400);
    expect(ErrorStatusCode[ErrorCode.BAD_REQUEST]).toBe(400);
  });

  it("maps rate limit to 429", () => {
    expect(ErrorStatusCode[ErrorCode.RATE_LIMIT_EXCEEDED]).toBe(429);
  });

  it("maps server errors to 500", () => {
    expect(ErrorStatusCode[ErrorCode.SERVER_ERROR]).toBe(500);
    expect(ErrorStatusCode[ErrorCode.DATABASE_ERROR]).toBe(500);
  });

  it("maps conflict errors to 409", () => {
    expect(ErrorStatusCode[ErrorCode.ORDER_ALREADY_EXISTS]).toBe(409);
    expect(ErrorStatusCode[ErrorCode.WISHLIST_ALREADY_EXISTS]).toBe(409);
    expect(ErrorStatusCode[ErrorCode.CATEGORY_HAS_PRODUCTS]).toBe(409);
  });

  it("has a status code for every error code", () => {
    for (const code of Object.values(ErrorCode)) {
      expect(ErrorStatusCode[code]).toBeDefined();
      expect(typeof ErrorStatusCode[code]).toBe("number");
    }
  });
});

describe("ErrorMessage mapping", () => {
  it("has a message for every error code", () => {
    for (const code of Object.values(ErrorCode)) {
      expect(ErrorMessage[code]).toBeDefined();
      expect(typeof ErrorMessage[code]).toBe("string");
      expect(ErrorMessage[code].length).toBeGreaterThan(0);
    }
  });

  it("messages are user-friendly (no stack traces)", () => {
    for (const message of Object.values(ErrorMessage)) {
      // Should not contain stack trace patterns like "Error: ..." or file paths
      expect(message).not.toMatch(/^Error:/);
      expect(message).not.toContain("node_modules");
      expect(message).not.toContain(".ts:");
      expect(message).not.toContain(".js:");
    }
  });
});
