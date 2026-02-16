import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { handleUnexpectedError } from "@/lib/errors";

/**
 * POST /api/revalidate?path=/admin/products
 * Triggers Next.js on-demand revalidation for the given path.
 * Admin-only.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.success) return auth.error;

  try {
    const pathToRevalidate = request.nextUrl.searchParams.get("path") || "/admin/products";
    revalidatePath(pathToRevalidate);

    return NextResponse.json({ revalidated: true, path: pathToRevalidate });
  } catch (error) {
    return handleUnexpectedError(error, "POST /api/revalidate");
  }
}
