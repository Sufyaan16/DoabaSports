import { Suspense } from "react";
import { WishlistPageClient } from "./wishlist-page-client";
import { WishlistLoadingSkeleton } from "./wishlist-loading-skeleton";

export default function WishlistPage() {
  return (
    <Suspense fallback={<WishlistLoadingSkeleton />}>
      <WishlistPageClient />
    </Suspense>
  );
}
