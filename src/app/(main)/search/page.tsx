import { Suspense } from "react";
import { SearchPageClient } from "./search-page-client";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
