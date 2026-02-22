import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";
import { userMetadataSchema } from "@/lib/validations/user";
import { validateCsrf } from "@/lib/csrf";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── CSRF Protection: block cross-origin mutations to /api/* ──
  if (pathname.startsWith("/api")) {
    // Skip CSRF for Stripe webhooks — they use signature verification instead
    if (pathname.startsWith("/api/webhooks/stripe")) {
      return NextResponse.next();
    }
    const csrfResult = validateCsrf(request);
    if (csrfResult) return csrfResult;
    // API routes pass through — auth is handled inside each route
    return NextResponse.next();
  }

  // Initialize metadata for authenticated users
  let user: Awaited<ReturnType<typeof stackServerApp.getUser>> | null = null;
  try {
    user = await stackServerApp.getUser();
    
    if (user) {
      // Check if metadata needs initialization
      if (user.clientReadOnlyMetadata === null) {
        try {
          const newMetadata = {
            role: "customer" as const,
            createdAt: new Date().toISOString(),
          };

          // Validate metadata before saving
          const validation = userMetadataSchema.safeParse(newMetadata);
          
          if (!validation.success) {
            console.error("❌ Invalid user metadata:", validation.error.flatten().fieldErrors);
          } else {
            await user.update({
              clientMetadata: newMetadata
            });
            console.log("✅ Initialized metadata for user:", user.primaryEmail);
          }
        } catch (updateError) {
          console.error("❌ Error updating user metadata:", updateError);
        }
      }
    }
  } catch (error) {
    // Silently continue if not authenticated
  }

  // Check if the route is an admin route
  if (pathname.startsWith("/admin")) {
    try {
      // Reuse the user we already fetched above
      if (!user) {
        const signInUrl = new URL("/handler/sign-in", request.url);
        signInUrl.searchParams.set("after_auth_return_to", pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Check if user has admin role from clientReadOnlyMetadata
      // Handle both string ("admin") and object ({ role: "admin" }) formats
      const metadata = user.clientReadOnlyMetadata;
      const isAdmin =
        metadata === "admin" ||
        (typeof metadata === "object" &&
          metadata !== null &&
          (metadata as Record<string, unknown>).role === "admin");

      if (!isAdmin) {
        // User is logged in but not admin - redirect to home with error
        const homeUrl = new URL("/", request.url);
        return NextResponse.redirect(homeUrl);
      }

      // User is admin - allow access
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      // On error, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
