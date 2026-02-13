import { Suspense } from "react";
import { SearchPageClient } from "./search-page-client";
import { SearchPageSkeleton } from "./search-page-skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Products",
  description:
    "Search our collection of premium cricket equipment, bats, accessories, and apparel at Doaba Sports.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageClient />
    </Suspense>
  );
}
