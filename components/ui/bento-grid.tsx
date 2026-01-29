import * as React from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, cols = 2, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid gap-4 sm:gap-6",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        cols === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    />
  )
);
BentoGrid.displayName = "BentoGrid";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
}

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, colSpan = 1, rowSpan = 1, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-slate-200 bg-card p-0 shadow-sm transition-all duration-300 dark:border-slate-800",
        "overflow-hidden",
        colSpan === 1 && "col-span-1",
        colSpan === 2 && "col-span-1 sm:col-span-2",
        colSpan === 3 && "col-span-1 sm:col-span-2 lg:col-span-3",
        colSpan === 4 && "col-span-1 sm:col-span-2 lg:col-span-4",
        rowSpan === 1 && "row-span-1",
        rowSpan === 2 && "row-span-1 sm:row-span-2",
        rowSpan === 3 && "row-span-1 sm:row-span-3",
        "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700",
        className
      )}
      {...props}
    />
  )
);
BentoCard.displayName = "BentoCard";

export { BentoGrid, BentoCard };
