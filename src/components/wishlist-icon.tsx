"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@stackframe/stack";
import Link from "next/link";

export function WishlistIcon() {
  const user = useUser();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setWishlistCount(0);
      return;
    }

    const controller = new AbortController();

    const fetchWishlistCount = async () => {
      try {
        const response = await fetch("/api/wishlist", {
          signal: controller.signal,
        });
        
        if (!response.ok) {
          console.error("Failed to fetch wishlist:", response.status);
          return;
        }
        
        const data = await response.json();

        if (!controller.signal.aborted && data.success) {
          setWishlistCount(data.data.length);
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching wishlist count:", error);
        }
      }
    };

    fetchWishlistCount();

    return () => {
      controller.abort();
    };
  }, [user]);

  // Listen for custom events to update count
  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    const handleWishlistUpdate = async () => {
      try {
        const response = await fetch("/api/wishlist", {
          signal: controller.signal,
        });
        
        if (!response.ok) {
          console.error("Failed to fetch wishlist:", response.status);
          return;
        }
        
        const data = await response.json();

        if (!controller.signal.aborted && data.success) {
          setWishlistCount(data.data.length);
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching wishlist count:", error);
        }
      }
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdate);

    return () => {
      controller.abort();
      window.removeEventListener("wishlist-updated", handleWishlistUpdate);
    };
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Link href="/wishlist">
      <Button variant="ghost" size="icon" className="relative">
        <Heart className="h-5 w-5" />
        {wishlistCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {wishlistCount > 9 ? "9+" : wishlistCount}
          </Badge>
        )}
        <span className="sr-only">Wishlist ({wishlistCount})</span>
      </Button>
    </Link>
  );
}
