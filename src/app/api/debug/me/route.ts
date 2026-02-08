import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

// GET current user info (for debugging ONLY - disabled in production)
export async function GET() {
  // Block in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is disabled in production" },
      { status: 404 }
    );
  }

  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.primaryEmail,
      metadata: user.clientReadOnlyMetadata,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 500 }
    );
  }
}
