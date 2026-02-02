"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Package, ShoppingCart } from "lucide-react";
import { cn, proxyImageUrl } from "@/lib/utils";
import type { VersusProduct } from "@/lib/supabase/queries";

const PLACEHOLDER_IMAGE =
  "https://m.media-amazon.com/images/I/717ic2tAFEL._AC_SL1500_.jpg";

// ============================================
// Types
// ============================================

export interface VersusViewProps {
  products: [VersusProduct, VersusProduct];
}

// ============================================
// Helpers
// ============================================

function getPrice(product: VersusProduct): number | null {
  return product.min_price ?? product.max_price ?? null;
}

function formatPrice(price: number | null): string {
  if (price == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

function starRatingFromScore(score: number | null): number {
  if (score == null) return 0;
  return Math.round((score / 10) * 5);
}

// ============================================
// VS Badge (center, scale 0 → 1 then pulse [1, 1.1, 1])
// ============================================

function VsBadge({ absolute }: { absolute?: boolean }) {
  return (
    <motion.div
      className={cn(
        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-bold text-primary sm:h-14 sm:w-14 sm:text-base",
        absolute && "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
      )}
      initial={{ scale: 0 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{
        scale: {
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 1,
        },
      }}
      aria-hidden
    >
      VS
    </motion.div>
  );
}

// ============================================
// Sticky Header (glass, thumbnails + names + price + Acheter)
// ============================================

function VersusStickyHeader({
  productA,
  productB,
  buyUrlA,
  buyUrlB,
  priceA,
  priceB,
  cheapestIndex,
}: {
  productA: VersusProduct;
  productB: VersusProduct;
  buyUrlA: string;
  buyUrlB: string;
  priceA: number | null;
  priceB: number | null;
  cheapestIndex: 0 | 1 | null;
}) {
  return (
    <div className="glass sticky top-16 z-30 border-b border-slate-200/80 dark:border-slate-800">
      <div className="container relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 sm:px-6">
        {/* Product A */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted sm:h-16 sm:w-16">
            {productA.main_image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={proxyImageUrl(productA.main_image_url, 128)}
                alt={productA.name}
                className="absolute inset-0 h-full w-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold sm:text-base">
              {productA.name}
            </p>
            {productA.brand_name && (
              <p className="truncate text-xs text-muted-foreground">
                {productA.brand_name}
              </p>
            )}
            <p
              className={cn(
                "text-sm font-medium",
                cheapestIndex === 0 && "text-green-600 dark:text-green-400"
              )}
            >
              {formatPrice(priceA)}
            </p>
          </div>
          <Button size="sm" className="flex-shrink-0 gap-1.5" asChild>
            <Link href={buyUrlA}>
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Acheter</span>
            </Link>
          </Button>
        </div>

        <VsBadge />

        {/* Product B */}
        <div className="flex min-w-0 items-center gap-3">
          <Button
            size="sm"
            className="order-3 flex-shrink-0 gap-1.5 sm:order-1"
            asChild
          >
            <Link href={buyUrlB}>
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Acheter</span>
            </Link>
          </Button>
          <div className="order-2 min-w-0 flex-1 text-right">
            <p className="truncate text-sm font-semibold sm:text-base">
              {productB.name}
            </p>
            {productB.brand_name && (
              <p className="truncate text-xs text-muted-foreground">
                {productB.brand_name}
              </p>
            )}
            <p
              className={cn(
                "text-sm font-medium",
                cheapestIndex === 1 && "text-green-600 dark:text-green-400"
              )}
            >
              {formatPrice(priceB)}
            </p>
          </div>
          <div className="relative order-1 h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted sm:order-3 sm:h-16 sm:w-16">
            {productB.main_image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={proxyImageUrl(productB.main_image_url, 128)}
                alt={productB.name}
                className="absolute inset-0 h-full w-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Comparison Row (label + value A + value B, optional Progress)
// ============================================

function ComparisonRow({
  label,
  valueA,
  valueB,
  winnerIndex,
  progressValueA,
  progressValueB,
}: {
  label: string;
  valueA: React.ReactNode;
  valueB: React.ReactNode;
  winnerIndex?: 0 | 1 | null;
  progressValueA?: number;
  progressValueB?: number;
}) {
  const showProgress =
    progressValueA != null && progressValueB != null;
  const maxVal = showProgress
    ? Math.max(progressValueA, progressValueB, 1)
    : 100;
  const pctA = showProgress ? (progressValueA / maxVal) * 100 : 0;
  const pctB = showProgress ? (progressValueB / maxVal) * 100 : 0;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 border-b border-slate-200/80 py-4 last:border-0 dark:border-slate-800 sm:gap-6">
      <div className="flex flex-col justify-center gap-1.5">
        <span
          className={cn(
            "text-sm font-medium",
            winnerIndex === 0 && "text-green-600 dark:text-green-400"
          )}
        >
          {valueA}
        </span>
        {showProgress && (
          <Progress value={pctA} className="h-2 w-full" />
        )}
      </div>
      <div className="flex items-center justify-center text-center text-xs font-medium text-muted-foreground sm:text-sm">
        {label}
      </div>
      <div className="flex flex-col justify-center gap-1.5 text-right">
        <span
          className={cn(
            "text-sm font-medium",
            winnerIndex === 1 && "text-green-600 dark:text-green-400"
          )}
        >
          {valueB}
        </span>
        {showProgress && (
          <Progress value={pctB} className="h-2 w-full" />
        )}
      </div>
    </div>
  );
}

// ============================================
// Main View
// ============================================

export function VersusView({ products }: VersusViewProps) {
  const [productA, productB] = products;
  const [activeTab, setActiveTab] = useState<"left" | "right">("left");

  const priceA = getPrice(productA);
  const priceB = getPrice(productB);
  const cheapestIndex: 0 | 1 | null =
    priceA != null && priceB != null
      ? priceA <= priceB
        ? 0
        : 1
      : null;

  const wattageA = productA.wattage ?? 0;
  const wattageB = productB.wattage ?? 0;

  const capacityA = productA.capacity_liters ?? 0;
  const capacityB = productB.capacity_liters ?? 0;

  const starsA = starRatingFromScore(productA.rating_overall);
  const starsB = starRatingFromScore(productB.rating_overall);
  const betterRatingIndex: 0 | 1 | null =
    productA.rating_overall != null && productB.rating_overall != null
      ? productA.rating_overall >= productB.rating_overall
        ? 0
        : 1
      : null;

  const buyUrlA = productA.affiliate_url || `/product/${productA.slug}`;
  const buyUrlB = productB.affiliate_url || `/product/${productB.slug}`;

  return (
    <div className="min-h-screen">
      <VersusStickyHeader
        productA={productA}
        productB={productB}
        buyUrlA={buyUrlA}
        buyUrlB={buyUrlB}
        priceA={priceA}
        priceB={priceB}
        cheapestIndex={cheapestIndex}
      />

      <div className="container py-6 sm:py-8">
        {/* Desktop: 2 columns (grid-cols-2) + specs */}
        <div className="hidden md:block">
          <div className="relative grid grid-cols-2 gap-6 pb-8">
            <ProductColumn
              product={productA}
              buyUrl={buyUrlA}
              imageUrl={productA.main_image_url || PLACEHOLDER_IMAGE}
            />
            <VsBadge absolute />
            <ProductColumn
              product={productB}
              buyUrl={buyUrlB}
              imageUrl={productB.main_image_url || PLACEHOLDER_IMAGE}
            />
          </div>

          <Card className="overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800">
            <CardContent className="px-4 py-6 sm:px-6">
              <h2 className="mb-6 text-lg font-semibold tracking-tight">
                Comparatif
              </h2>

              <ComparisonRow
                label="Prix"
                valueA={
                  <>
                    {formatPrice(priceA)}
                    {cheapestIndex === 0 && (
                      <span className="ml-2 inline-flex rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                        Meilleur Prix
                      </span>
                    )}
                  </>
                }
                valueB={
                  <>
                    {formatPrice(priceB)}
                    {cheapestIndex === 1 && (
                      <span className="ml-2 inline-flex rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                        Meilleur Prix
                      </span>
                    )}
                  </>
                }
                winnerIndex={cheapestIndex}
              />

              <ComparisonRow
                label="Puissance"
                valueA={
                  productA.wattage != null ? `${productA.wattage} W` : "—"
                }
                valueB={
                  productB.wattage != null ? `${productB.wattage} W` : "—"
                }
                progressValueA={wattageA}
                progressValueB={wattageB}
              />

              <ComparisonRow
                label="Capacité"
                valueA={
                  productA.capacity_liters != null
                    ? `${productA.capacity_liters} L`
                    : "—"
                }
                valueB={
                  productB.capacity_liters != null
                    ? `${productB.capacity_liters} L`
                    : "—"
                }
                progressValueA={capacityA}
                progressValueB={capacityB}
              />

              <ComparisonRow
                label="Avis"
                valueA={
                  <span className="inline-flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < starsA
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                    {productA.rating_overall != null && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        {productA.rating_overall.toFixed(1)}/10
                      </span>
                    )}
                  </span>
                }
                valueB={
                  <span className="inline-flex items-center gap-0.5">
                    {productB.rating_overall != null && (
                      <span className="mr-1 text-xs text-muted-foreground">
                        {productB.rating_overall.toFixed(1)}/10
                      </span>
                    )}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < starsB
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </span>
                }
                winnerIndex={betterRatingIndex}
              />
            </CardContent>
          </Card>
        </div>

        {/* Mobile: activeTab left | right, one product at a time */}
        <div className="md:hidden">
          <div className="mb-6 flex rounded-2xl border border-slate-200 bg-muted/30 p-1 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("left")}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors",
                activeTab === "left"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {productA.name.length > 18
                ? productA.name.slice(0, 18) + "…"
                : productA.name}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("right")}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors",
                activeTab === "right"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {productB.name.length > 18
                ? productB.name.slice(0, 18) + "…"
                : productB.name}
            </button>
          </div>

          {activeTab === "left" ? (
            <MobileProductCard
              product={productA}
              buyUrl={buyUrlA}
              isPriceWinner={cheapestIndex === 0}
              isRatingWinner={betterRatingIndex === 0}
            />
          ) : (
            <MobileProductCard
              product={productB}
              buyUrl={buyUrlB}
              isPriceWinner={cheapestIndex === 1}
              isRatingWinner={betterRatingIndex === 1}
            />
          )}

          <Card className="mt-8 overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                Comparatif
              </h2>
              <div className="space-y-4">
                <SpecLine
                  label="Prix"
                  valueA={formatPrice(priceA)}
                  valueB={formatPrice(priceB)}
                  winnerA={cheapestIndex === 0}
                  winnerB={cheapestIndex === 1}
                />
                <SpecLine
                  label="Puissance"
                  valueA={
                    productA.wattage != null ? `${productA.wattage} W` : "—"
                  }
                  valueB={
                    productB.wattage != null ? `${productB.wattage} W` : "—"
                  }
                />
                <SpecLine
                  label="Capacité"
                  valueA={
                    productA.capacity_liters != null
                      ? `${productA.capacity_liters} L`
                      : "—"
                  }
                  valueB={
                    productB.capacity_liters != null
                      ? `${productB.capacity_liters} L`
                      : "—"
                  }
                />
                <SpecLine
                  label="Avis"
                  valueA={
                    productA.rating_overall != null
                      ? `${productA.rating_overall.toFixed(1)}/10`
                      : "—"
                  }
                  valueB={
                    productB.rating_overall != null
                      ? `${productB.rating_overall.toFixed(1)}/10`
                      : "—"
                  }
                  winnerA={betterRatingIndex === 0}
                  winnerB={betterRatingIndex === 1}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Desktop: single product column (Card)
// ============================================

function ProductColumn({
  product,
  buyUrl,
  imageUrl,
}: {
  product: VersusProduct;
  buyUrl: string;
  imageUrl: string;
}) {
  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800">
      <CardContent className="p-6">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proxyImageUrl(imageUrl, 600)}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
        <h3 className="mt-4 text-center text-lg font-semibold tracking-tight">
          {product.name}
        </h3>
        {product.brand_name && (
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {product.brand_name}
          </p>
        )}
        <Button className="mt-4 w-full gap-2" asChild>
          <Link href={buyUrl}>
            <ShoppingCart className="h-4 w-4" />
            Acheter
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================
// Mobile: single product card
// ============================================

function MobileProductCard({
  product,
  buyUrl,
  isPriceWinner,
  isRatingWinner,
}: {
  product: VersusProduct;
  buyUrl: string;
  isPriceWinner: boolean;
  isRatingWinner: boolean;
}) {
  const stars = starRatingFromScore(product.rating_overall);
  const price = getPrice(product);

  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proxyImageUrl(product.main_image_url || PLACEHOLDER_IMAGE, 800)}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold tracking-tight">{product.name}</h3>
        {product.brand_name && (
          <p className="text-sm text-muted-foreground">{product.brand_name}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          {price != null && (
            <span
              className={cn(
                "text-lg font-semibold text-primary",
                isPriceWinner &&
                  "rounded bg-green-500/15 px-2 py-0.5 text-green-600 dark:text-green-400"
              )}
            >
              {formatPrice(price)}
              {isPriceWinner && (
                <span className="ml-1 text-xs font-medium">Meilleur Prix</span>
              )}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < stars
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
            />
          ))}
          {product.rating_overall != null && (
            <span className="ml-1 text-sm text-muted-foreground">
              {product.rating_overall.toFixed(1)}/10
            </span>
          )}
        </div>
        <Button className="mt-4 w-full gap-2" asChild>
          <Link href={buyUrl}>
            <ShoppingCart className="h-4 w-4" />
            Acheter
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function SpecLine({
  label,
  valueA,
  valueB,
  winnerA,
  winnerB,
}: {
  label: string;
  valueA: string;
  valueB: string;
  winnerA?: boolean;
  winnerB?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-3 last:border-0 dark:border-slate-800">
      <span
        className={cn(
          "min-w-0 flex-1 text-left text-sm font-medium",
          winnerA && "text-green-600 dark:text-green-400"
        )}
      >
        {valueA}
      </span>
      <span className="flex-shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 text-right text-sm font-medium",
          winnerB && "text-green-600 dark:text-green-400"
        )}
      >
        {valueB}
      </span>
    </div>
  );
}
