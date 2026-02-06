import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { userMetadataSchema } from "@/lib/validations/user";

export type AuthResult = {
  success: false;
  error: NextResponse;
} | {
  success: true;
  user: Awaited<ReturnType<typeof stackServerApp.getUser>>;
  userId: string;
  role: "admin" | "customer";
};

/**
 * Validates that a user is authenticated
 * @returns Authentication result with user data or error response
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return {
        success: false,
        error: NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        ),
      };
    }

    // Validate and extract role from metadata
    // Stack Auth clientReadOnlyMetadata can be:
    // 1. An object: { role: "admin", createdAt: "..." }
    // 2. Just a string: "admin" (legacy format)
    // 3. null/undefined
    let role: "admin" | "customer" = "customer";
    
    if (user.clientReadOnlyMetadata) {
      const metadata = user.clientReadOnlyMetadata as any;
      
      // Handle string format (legacy): "admin" or "customer"
      if (typeof metadata === "string") {
        if (metadata === "admin" || metadata === "customer") {
          role = metadata;
        }
      }
      // Handle object format: { role: "admin", createdAt: "..." }
      else if (typeof metadata === "object" && metadata !== null) {
        if (metadata.role === "admin" || metadata.role === "customer") {
          role = metadata.role;
        } else {
          // Try schema validation as fallback
          const validation = userMetadataSchema.safeParse(metadata);
          if (validation.success) {
            role = validation.data.role;
          }
        }
      }
    }

    return {
      success: true,
      user,
      userId: user.id,
      role,
    };
  } catch (error) {
    console.error("❌ Auth error:", error);
    return {
      success: false,
      error: NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Validates that a user is authenticated AND has admin role
 * @returns Authentication result with admin user data or error response
 */
export async function requireAdmin(): Promise<AuthResult> {
  const authResult = await requireAuth();

  if (!authResult.success) {
    return authResult;
  }

  if (authResult.role !== "admin") {
    return {
      success: false,
      error: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Validates that a user is authenticated and is the owner of a resource
 * @param resourceUserId - The user ID that owns the resource
 * @returns true if user is owner or admin, false otherwise
 */
export function isOwnerOrAdmin(authResult: Extract<AuthResult, { success: true }>, resourceUserId: string): boolean {
  return authResult.userId === resourceUserId || authResult.role === "admin";
}
