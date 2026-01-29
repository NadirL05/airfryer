"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Package, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompareStore } from "@/hooks/use-compare-store";

/** Fallback when product has no image (allowed in next.config) */
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1585307518179-e6c30c1f0dcc?auto=format&fit=crop&q=80&w=400";

// ============================================
// Types
// ============================================

export interface ProductCardProps {
  id: string;
  title: string;
  image_url: string | null;
  price: number;
  score: number | null;
  capacity: string;
  badge_text?: string;
  slug?: string;
  brand_name?: string | null;
  /** When true, show a checkbox for duel selection (Versus) instead of compare-list button */
  enableSelection?: boolean;
}

// ============================================
// Component
// ============================================

export function ProductCard({
  id,
  title,
  image_url,
  price,
  score,
  capacity,
  badge_text,
  slug,
  brand_name,
  enableSelection = false,
}: ProductCardProps) {
  const addProduct = useCompareStore((s) => s.addProduct);
  const removeProduct = useCompareStore((s) => s.removeProduct);
  const isInCompare = useCompareStore((s) => s.products.some((p) => p.id === id));
  const isFull = useCompareStore((s) => s.products.length >= s.maxItems);
  const selectedIds = useCompareStore((s) => s.selectedIds);
  const toggleSelection = useCompareStore((s) => s.toggleSelection);
  const isSelectedForDuel = selectedIds.includes(id);

  // Determine score badge color
  const getScoreBadgeColor = (score: number | null) => {
    if (!score) return "bg-muted text-muted-foreground";
    if (score > 8) return "bg-perf-excellent text-white";
    if (score > 5) return "bg-perf-average text-foreground";
    return "bg-perf-poor text-white";
  };

  // Calculate star rating (0-5 stars based on score 0-10)
  const starRating = score ? Math.round((score / 10) * 5) : 0;

  // Format price
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  const productUrl = slug ? `/produit/${slug}` : `/produit/${id}`;

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare) {
      removeProduct(id);
    } else if (!isFull) {
      addProduct({
        id,
        slug: slug || id,
        title,
        image: image_url,
        price,
        brand: brand_name || null,
      });
    }
  };

  const handleDuelToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSelection(id);
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Top Right: Duel selection (checkbox) or Compare list (button) */}
      {enableSelection ? (
        <button
          type="button"
          onClick={handleDuelToggle}
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/90 shadow-sm backdrop-blur-sm transition-all hover:border-primary hover:bg-background"
          aria-label={isSelectedForDuel ? "Retirer du duel" : "Sélectionner pour le duel"}
          title={isSelectedForDuel ? "Retirer du duel" : "Sélectionner pour le duel"}
        >
          <Checkbox
            checked={isSelectedForDuel}
            className="pointer-events-none h-5 w-5"
          />
        </button>
      ) : (
        <button
          onClick={handleCompareToggle}
          disabled={!isInCompare && isFull}
          className={cn(
            "absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all",
            isInCompare
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border bg-background/80 text-muted-foreground backdrop-blur-sm hover:border-primary hover:text-primary",
            !isInCompare && isFull && "cursor-not-allowed opacity-50"
          )}
          aria-label={isInCompare ? "Retirer du comparateur" : "Ajouter au comparateur"}
          title={
            isInCompare
              ? "Retirer du comparateur"
              : isFull
              ? "Comparateur plein (3 max)"
              : "Ajouter au comparateur"
          }
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
      )}

      {/* Image Container with Badges */}
      <Link href={productUrl} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={image_url || PLACEHOLDER_IMAGE}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Top Left: Capacity Badge */}
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-lg border border-border bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
              {capacity}
            </span>
          </div>

          {/* Score Badge - Below compare button */}
          {score !== null && (
            <div className="absolute right-3 top-12">
              <span
                className={cn(
                  "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold",
                  getScoreBadgeColor(score)
                )}
              >
                {score.toFixed(1)}/10
              </span>
            </div>
          )}

          {/* Optional Badge Text (e.g., "Meilleur choix", "Nouveau") */}
          {badge_text && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                {badge_text}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <CardContent className="p-4">
        {/* Title (2 lines max) */}
        <Link href={productUrl}>
          <h3 className="mb-2 line-clamp-2 min-h-[3rem] text-sm font-semibold leading-tight hover:text-primary">
            {title}
          </h3>
        </Link>

        {/* Brand */}
        {brand_name && (
          <p className="mb-2 text-xs text-muted-foreground">{brand_name}</p>
        )}

        {/* Rating Stars */}
        <div className="mb-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={cn(
                "h-4 w-4",
                index < starRating
                  ? "fill-star-filled text-star-filled"
                  : "fill-star-empty text-star-empty"
              )}
            />
          ))}
          {score !== null && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({score.toFixed(1)})
            </span>
          )}
        </div>

        {/* Price */}
        <div className="text-2xl font-bold text-foreground">{formattedPrice}</div>
      </CardContent>

      {/* Footer: Buttons */}
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={productUrl}>Voir le test</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
