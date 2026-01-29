import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <div className="mx-20">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>

      {/* Product Carousel Skeleton */}
      <section className="w-full py-16 px-4 md:px-8 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-12 w-64 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
