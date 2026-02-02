"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, proxyImageUrl } from "@/lib/utils";

const SCROLL_THRESHOLD_PX = 300;

export interface StickyActionBarProps {
  /** Formatted price string (e.g. "99 €" or "79 € - 129 €") */
  price: string;
  productTitle: string;
  affiliateLink: string;
  mainImage: string | null;
}

export function StickyActionBar({
  price,
  productTitle,
  affiliateLink,
  mainImage,
}: StickyActionBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(y > SCROLL_THRESHOLD_PX);
    };

    handleScroll(); // initial check
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      role="region"
      aria-label="Achat rapide"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border/80",
        "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
        "transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-3 px-4 py-2 sm:h-14 sm:gap-4 sm:py-2">
        {/* Left: thumbnail + title + price */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          {mainImage && (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted sm:h-11 sm:w-11">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxyImageUrl(mainImage, 100)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {/* Title: hidden on small mobile, truncated on larger */}
            <p className="hidden truncate text-sm font-medium text-foreground sm:block">
              {productTitle}
            </p>
            <p className="text-base font-bold text-primary sm:text-sm">
              {price}
            </p>
          </div>
        </div>

        {/* Right: CTA */}
        <Button
          asChild
          size="default"
          className="shrink-0 font-semibold sm:px-6"
        >
          <a
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Voir l&apos;offre
          </a>
        </Button>
      </div>
    </div>
  );
}
