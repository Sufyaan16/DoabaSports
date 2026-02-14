import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { uploadImage } from "@/lib/cloudinary";
import { checkRateLimit, getIpAddress } from "@/lib/rate-limit";
import {
  createErrorResponse,
  createSuccessResponse,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * POST /api/upload
 * Accepts a multipart form with a single "file" field.
 * Uploads it to Cloudinary and returns the URL.
 * Admin-only, rate-limited.
 */
export async function POST(request: NextRequest) {
  // Rate limit — strict (20/min for uploads)
  const ipAddress = getIpAddress(request);
  const rateLimitResult = await checkRateLimit(
    `ip:${ipAddress}`,
    "strict",
  );
  if (rateLimitResult) return rateLimitResult;

  // Auth — admin only
  const auth = await requireAdmin();
  if (!auth.success) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_FAILED,
        message: "No file provided",
      });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_FAILED,
        message: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(", ")}`,
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_FAILED,
        message: "File too large. Maximum size is 10MB.",
      });
    }

    // Convert File to base64 data URI for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Determine folder from optional query param
    const folder =
      request.nextUrl.searchParams.get("folder") || "doaba-sports";

    const result = await uploadImage(dataUri, { folder });

    logger.info("Image uploaded to Cloudinary", {
      publicId: result.publicId,
      userId: auth.userId,
    });

    return createSuccessResponse({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    logger.error("Upload failed", { error });
    return handleUnexpectedError(error);
  }
}
