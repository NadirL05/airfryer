import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card>
      {/* Image Skeleton */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content Skeleton */}
      <CardContent className="p-4">
        {/* Title Skeleton */}
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="mb-3 h-4 w-1/2" />

        {/* Stars Skeleton */}
        <div className="mb-3 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-full" />
          ))}
        </div>

        {/* Price Skeleton */}
        <Skeleton className="h-8 w-24" />
      </CardContent>

      {/* Footer Skeleton */}
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
