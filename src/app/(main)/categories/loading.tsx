import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Category Banner Skeleton */}
      <div className="w-full h-64 bg-muted">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Category Cards Skeleton */}
      <section className="w-full py-16 px-4 md:px-8 lg:px-20 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-75 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
