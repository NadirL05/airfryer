"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, GitCompareArrows, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCompareStore,
  useCompareProducts,
  useCompareCount,
} from "@/hooks/use-compare-store";
import { cn, proxyImageUrl } from "@/lib/utils";

// ============================================
// Component
// ============================================

export function CompareBar() {
  const products = useCompareProducts();
  const count = useCompareCount();
  const removeProduct = useCompareStore((s) => s.removeProduct);
  const clear = useCompareStore((s) => s.clear);

  // Hydration fix for SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server or if empty
  if (!mounted || products.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "border-t bg-background/80 backdrop-blur-lg shadow-lg",
        "transform transition-transform duration-300 ease-out",
        products.length > 0 ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title + Products */}
          <div className="flex items-center gap-4">
            {/* Title */}
            <div className="flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">
                Comparateur{" "}
                <span className="text-muted-foreground">
                  ({count}/3)
                </span>
              </span>
            </div>

            {/* Product Thumbnails */}
            <div className="flex items-center gap-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group relative"
                >
                  {/* Thumbnail */}
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted">
                    {product.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={proxyImageUrl(product.image, 96)}
                        alt={product.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Remove Button (on hover) */}
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Retirer ${product.title}`}
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block">
                    {product.title}
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-popover" />
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 3 - products.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/20 bg-muted/30"
                >
                  <span className="text-xs text-muted-foreground/50">+</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Clear Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="gap-1.5 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Effacer</span>
            </Button>

            {/* Compare Button */}
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/compare">
                <GitCompareArrows className="h-4 w-4" />
                <span>Comparer</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Compact variant for mobile
// ============================================

export function CompareBarCompact() {
  const products = useCompareProducts();
  const count = useCompareCount();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || products.length === 0) {
    return null;
  }

  return (
    <Link
      href="/compare"
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "flex items-center gap-2 rounded-full",
        "bg-primary px-4 py-2.5 text-primary-foreground shadow-lg",
        "transition-transform hover:scale-105",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
    >
      <GitCompareArrows className="h-5 w-5" />
      <span className="text-sm font-medium">
        Comparer ({count})
      </span>
    </Link>
  );
}
