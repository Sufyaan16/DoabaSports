import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function POST() {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if metadata is already set
    if (user.clientReadOnlyMetadata !== null) {
      return NextResponse.json({ 
        message: "Metadata already initialized",
        metadata: user.clientReadOnlyMetadata 
      });
    }

    // Initialize metadata with customer role
    await user.update({
      clientReadOnlyMetadata: {
        role: "customer",
        createdAt: new Date().toISOString(),
      }
    });

    return NextResponse.json({ 
      message: "User metadata initialized successfully",
      metadata: {
        role: "customer",
        createdAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error("Error initializing user:", error);
    return NextResponse.json(
      { error: "Failed to initialize user metadata" },
      { status: 500 }
    );
  }
}
