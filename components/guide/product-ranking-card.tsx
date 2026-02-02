import Link from "next/link";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, proxyImageUrl } from "@/lib/utils";

export type BannerVariant = "blue" | "gold";

export interface ProductRankingCardProps {
  /** Colored banner on top left (e.g. "Meilleur Choix", "Premium") */
  bannerLabel: string;
  /** Banner color: blue or gold */
  bannerVariant?: BannerVariant;
  title: string;
  imageUrl: string;
  rating: number; // 0-5
  /** Mini bullet list of 3 key specs (e.g. "Double Panier", "2400W", "Appli") */
  features: string[];
  /** Short 1-line verdict in italic */
  verdict: string;
  price: string;
  affiliateUrl: string;
  /** Big CTA button text (e.g. "Voir le prix sur Amazon") */
  ctaLabel: string;
  reviewUrl?: string;
  className?: string;
}

const BANNER_STYLES: Record<BannerVariant, string> = {
  blue:
    "bg-blue-500/12 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  gold:
    "bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-800",
};

export function ProductRankingCard({
  bannerLabel,
  bannerVariant = "blue",
  title,
  imageUrl,
  rating,
  features,
  verdict,
  price,
  affiliateUrl,
  ctaLabel,
  reviewUrl,
  className,
}: ProductRankingCardProps) {
  const safeRating = Math.max(0, Math.min(5, rating));
  const roundedRating = Math.round(safeRating * 10) / 10;

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950",
        "md:flex-row md:items-stretch",
        className
      )}
    >
      {/* Image — ~30% on desktop */}
      <div className="relative flex shrink-0 items-center justify-center bg-gray-50 p-6 dark:bg-gray-900 md:w-[30%]">
        <div className="relative h-40 w-full max-w-[200px] md:h-44 md:max-w-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proxyImageUrl(imageUrl, 400)}
            alt={title}
            className="absolute inset-0 h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>

      {/* Content — ~45% on desktop */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 border-t border-gray-200 p-5 dark:border-gray-800 md:w-[45%] md:border-t-0 md:border-l">
        {/* Banner */}
        <span
          className={cn(
            "inline-flex w-fit rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
            BANNER_STYLES[bannerVariant]
          )}
        >
          {bannerLabel}
        </span>

        <h3 className="text-lg font-semibold leading-tight text-foreground md:text-xl">
          {title}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i <= safeRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200 dark:text-gray-700"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {roundedRating}/5
          </span>
        </div>

        {/* Features — 3 key specs */}
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <span className="h-1 w-1 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Verdict — 1-line italic */}
        <p className="italic text-sm text-foreground/90">
          &ldquo;{verdict}&rdquo;
        </p>
      </div>

      {/* Action — ~25% on desktop */}
      <div className="flex flex-col justify-between gap-4 border-t border-gray-200 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50 md:w-[25%] md:border-t-0 md:border-l">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Prix indicatif
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {price}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            asChild
            size="lg"
            className="h-12 w-full text-base font-bold shadow-md transition-all hover:shadow-lg"
          >
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              {ctaLabel}
            </a>
          </Button>

          {reviewUrl && (
            <Link
              href={reviewUrl}
              className="text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Lire le test complet
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
