import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { handleUnexpectedError } from "@/lib/errors";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";

/**
 * POST /api/revalidate?path=/admin/products
 * Triggers Next.js on-demand revalidation for the given path.
 * Admin-only.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.success) return auth.error;

  // Rate limit - strict (10/min)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(auth.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "strict");
  if (rateLimitResult) return rateLimitResult;

  try {
    const pathToRevalidate = request.nextUrl.searchParams.get("path") || "/admin/products";
    revalidatePath(pathToRevalidate);

    return NextResponse.json({ revalidated: true, path: pathToRevalidate });
  } catch (error) {
    return handleUnexpectedError(error, "POST /api/revalidate");
  }
}
