"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Package, ArrowLeftRight } from "lucide-react";
import { cn, proxyImageUrl } from "@/lib/utils";
import { useCompareStore } from "@/hooks/use-compare-store";

/** Fallback when product has no image or load fails (allowed in next.config) */
const FALLBACK_IMAGE =
  "https://m.media-amazon.com/images/I/71Q7hXp3k8L._AC_SL1500_.jpg";

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
  /** Optional: for dynamic badges (XXL Famille if >= 8) */
  capacity_liters?: number | null;
  /** Optional: for "Fenêtre" badge */
  has_window?: boolean;
  /** Lien d'affiliation Amazon – si vide/null, le bouton "Voir l'offre" n'est pas affiché */
  affiliate_url?: string | null;
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
  capacity_liters: capacityLitersProp,
  has_window: hasWindow = false,
  affiliate_url: affiliateUrl,
}: ProductCardProps) {
  const capacityNum = capacityLitersProp ?? (capacity ? parseFloat(capacity.replace(/[^0-9.]/g, "")) || null : null);
  const dynamicBadges: { label: string; className: string }[] = [];
  if (score != null && score >= 9.5) dynamicBadges.push({ label: "🌟 Top Avis", className: "bg-amber-500/95 text-white border-amber-600/80" });
  if (capacityNum != null && capacityNum >= 8) dynamicBadges.push({ label: "👨‍👩‍👧‍👦 XXL Famille", className: "bg-blue-600/95 text-white border-blue-700/80" });
  if (price < 60) dynamicBadges.push({ label: "🏷️ Petit Prix", className: "bg-emerald-600/95 text-white border-emerald-700/80" });
  if (hasWindow) dynamicBadges.push({ label: "👁️ Fenêtre", className: "bg-violet-600/95 text-white border-violet-700/80" });
  const addProduct = useCompareStore((s) => s.addProduct);
  const removeProduct = useCompareStore((s) => s.removeProduct);
  const isInCompare = useCompareStore((s) => s.products.some((p) => p.id === id));
  const isFull = useCompareStore((s) => s.products.length >= s.maxItems);
  const selectedIds = useCompareStore((s) => s.selectedIds);
  const toggleSelection = useCompareStore((s) => s.toggleSelection);
  const isSelectedForDuel = selectedIds.includes(id);
  const [imgSrc, setImgSrc] = useState<string>(
    proxyImageUrl(image_url ?? FALLBACK_IMAGE, 800)
  );

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

  const productUrl = slug ? `/product/${slug}` : `/product/${id}`;

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgSrc(proxyImageUrl(FALLBACK_IMAGE, 800))}
            loading="lazy"
          />

          {/* Top Left: Capacity + Dynamic Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 sm:left-3 sm:top-3">
            <span className="inline-flex w-fit items-center rounded-lg border border-border bg-background/80 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
              {capacity}
            </span>
            {dynamicBadges.slice(0, 2).map((b) => (
              <span
                key={b.label}
                className={cn(
                  "inline-flex w-fit items-center rounded-lg border px-2 py-0.5 text-xs font-medium shadow-sm",
                  b.className
                )}
              >
                {b.label}
              </span>
            ))}
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
          <Link href={productUrl}>Lire le test</Link>
        </Button>
        {affiliateUrl && (
          <Button
            className="flex-1 bg-[#FF9900] text-white hover:bg-[#eb8c00] focus-visible:ring-[#FF9900]"
            asChild
          >
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir l&apos;offre
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
