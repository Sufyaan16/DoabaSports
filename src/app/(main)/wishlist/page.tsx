import { Suspense } from "react";
import { WishlistPageClient } from "./wishlist-page-client";
import { WishlistLoadingSkeleton } from "./wishlist-loading-skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <Suspense fallback={<WishlistLoadingSkeleton />}>
      <WishlistPageClient />
    </Suspense>
  );
}
