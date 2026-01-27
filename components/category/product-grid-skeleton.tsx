import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 12 }: ProductGridSkeletonProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {/* Image placeholder */}
      <Skeleton className="aspect-square w-full" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Stars */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-full" />
          ))}
        </div>

        {/* Price */}
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Button */}
      <div className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
