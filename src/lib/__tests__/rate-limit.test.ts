import { describe, it, expect } from "vitest";
import { getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";

describe("getRateLimitIdentifier", () => {
  it("prefers userId over IP", () => {
    expect(getRateLimitIdentifier("user123", "1.2.3.4")).toBe("user:user123");
  });

  it("falls back to IP when no userId", () => {
    expect(getRateLimitIdentifier(undefined, "1.2.3.4")).toBe("ip:1.2.3.4");
  });

  it("returns anonymous when no userId or IP", () => {
    expect(getRateLimitIdentifier()).toBe("anonymous");
    expect(getRateLimitIdentifier(undefined, undefined)).toBe("anonymous");
  });
});

describe("getIpAddress", () => {
  it("extracts from x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getIpAddress(request)).toBe("1.2.3.4");
  });

  it("extracts from x-real-ip", () => {
    const request = new Request("https://example.com", {
      headers: { "x-real-ip": "9.8.7.6" },
    });
    expect(getIpAddress(request)).toBe("9.8.7.6");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "1.1.1.1",
        "x-real-ip": "2.2.2.2",
      },
    });
    expect(getIpAddress(request)).toBe("1.1.1.1");
  });

  it("returns unknown when no headers", () => {
    const request = new Request("https://example.com");
    expect(getIpAddress(request)).toBe("unknown");
  });
});
