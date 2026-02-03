import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function WishlistLoadingSkeleton() {
  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-24" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-auto max-w-screen-2xl">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-full overflow-hidden p-0">
            <CardHeader className="relative block p-0">
              <AspectRatio ratio={1.268115942} className="overflow-hidden">
                <Skeleton className="size-full" />
              </AspectRatio>
            </CardHeader>
            <CardContent className="flex h-full flex-col gap-3 pb-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-5 w-20 mt-2" />
              <div className="mt-auto space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
