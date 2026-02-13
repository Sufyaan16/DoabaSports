import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CSRF protection via Origin header validation.
 *
 * Cookie-based auth (like StackAuth with `tokenStore: "nextjs-cookie"`) is
 * vulnerable to cross-site request forgery. Browsers automatically attach
 * cookies to cross-origin requests, so a malicious site can issue state-
 * changing requests on the user's behalf.
 *
 * We mitigate this by verifying that the `Origin` (or `Referer`) header on
 * every mutating request (POST/PUT/PATCH/DELETE) matches our own domain.
 * Browsers ALWAYS send the Origin header on cross-origin requests and cannot
 * be spoofed by JavaScript.
 *
 * GET/HEAD/OPTIONS are safe methods and are skipped.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Get the list of allowed origins.
 * In production, only the configured app URL is allowed.
 * In development, localhost variants are also allowed.
 */
function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  // App URL from env (the canonical production origin)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    origins.add(new URL(appUrl).origin);
  }

  // In dev, always allow localhost
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return origins;
}

/**
 * Validate that a request's Origin header matches an allowed origin.
 * Returns null if the request is safe (no CSRF risk), or a 403 response
 * if the origin is rejected.
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  // Safe methods don't need CSRF checks
  if (SAFE_METHODS.has(request.method)) {
    return null;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // At least one of Origin or Referer must be present
  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!requestOrigin) {
    // No origin header at all — block the request.
    // Modern browsers always send Origin on cross-origin fetches.
    // Legitimate same-origin requests also send it for POST/PUT/etc.
    return NextResponse.json(
      { error: { code: "CSRF_REJECTED", message: "Missing origin header" } },
      { status: 403 }
    );
  }

  const allowed = getAllowedOrigins();

  // If NEXT_PUBLIC_APP_URL is not configured (e.g. during initial setup),
  // fall back to the Host header as the canonical origin.
  if (allowed.size === 0) {
    const host = request.headers.get("host");
    if (host) {
      const protocol = request.nextUrl.protocol || "https:";
      allowed.add(`${protocol}//${host}`);
    }
  }

  if (!allowed.has(requestOrigin)) {
    console.warn(`CSRF blocked: origin=${requestOrigin}, allowed=${[...allowed].join(",")}`);
    return NextResponse.json(
      { error: { code: "CSRF_REJECTED", message: "Cross-origin request rejected" } },
      { status: 403 }
    );
  }

  return null;
}
