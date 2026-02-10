import { vi, describe, it, expect, beforeEach } from "vitest";

// ─── Module mocks (hoisted by vitest) ───────────────────────────
vi.mock("server-only", () => ({}));
vi.mock("@/stack/server", () => ({
  stackServerApp: { getUser: vi.fn().mockResolvedValue(null) },
}));

// ─── Imports ────────────────────────────────────────────────────
import { mockCustomer, mockUnauthenticated, type MockUser } from "./helpers";
import { stackServerApp } from "@/stack/server";

import { POST } from "@/app/api/init-user/route";

// ─── Helpers ────────────────────────────────────────────────────
function createPOSTRequest(): Request {
  return new Request("http://localhost:3000/api/init-user", { method: "POST" });
}

// ═════════════════════════════════════════════════════════════════
// POST /api/init-user
// ═════════════════════════════════════════════════════════════════
describe("POST /api/init-user", () => {
  it("returns 401 when not authenticated", async () => {
    mockUnauthenticated();
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns existing metadata if already initialized", async () => {
    mockCustomer();
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain("already initialized");
  });

  it("initializes metadata for new user", async () => {
    const updateFn = vi.fn().mockResolvedValue(undefined);
    const newUser: MockUser = {
      id: "user-new",
      clientReadOnlyMetadata: null,
      primaryEmail: "new@example.com",
      update: updateFn,
    } as any;

    vi.mocked(stackServerApp.getUser).mockResolvedValue(newUser as any);

    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain("initialized successfully");
    expect(body.metadata.role).toBe("customer");
    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        clientReadOnlyMetadata: expect.objectContaining({ role: "customer" }),
      }),
    );
  });
});
