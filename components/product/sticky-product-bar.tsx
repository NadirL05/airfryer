"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

const SENTINEL_ID = "product-hero-end";

export interface StickyProductBarProps {
  productTitle: string;
  displayPrice: string;
  affiliateLink: string;
  mainImage: string | null;
}

export function StickyProductBar({
  productTitle,
  displayPrice,
  affiliateLink,
  mainImage,
}: StickyProductBarProps) {
  const [visible, setVisible] = useState(false);
  const { track } = useAnalytics();

  const handleClick = () => {
    track("affiliate_click", {
      source: "sticky_bar",
      product: productTitle,
      price: displayPrice,
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const sentinel = document.getElementById(SENTINEL_ID);
      if (!sentinel) {
        setVisible(window.scrollY > 400);
        return;
      }
      const rect = sentinel.getBoundingClientRect();
      setVisible(rect.top < 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      role="region"
      aria-label="Achat rapide"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 w-full",
        "glass border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]",
        "transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container flex h-14 min-h-[52px] items-center gap-2 px-3 py-2 sm:h-16 sm:gap-4 sm:px-4 sm:py-2">
        {/* Left: thumbnail + name + price */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {mainImage && (
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted sm:h-11 sm:w-11">
              <Image
                src={mainImage}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
                unoptimized
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground sm:text-sm">
              {productTitle}
            </p>
            <p className="text-sm font-bold text-primary sm:text-base">
              {displayPrice}
            </p>
          </div>
        </div>

        {/* Right: CTA */}
        <Button
          asChild
          size="sm"
          className="shrink-0 gap-1.5 font-semibold sm:px-4 sm:py-2"
        >
          <a
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
          >
            Voir l&apos;offre
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

