 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  /** Optional label for the last segment (e.g. real product title) */
  customLabel?: string;
  className?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  product: "Test & Avis",
  compare: "Comparateur",
  blog: "Guides",
};

function humanizeSegment(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumbs({ customLabel, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  if (!pathname || pathname === "/") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  const items = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;

    const label =
      isLast && customLabel
        ? customLabel
        : humanizeSegment(decodeURIComponent(segment));

    return { href: isLast ? undefined : href, label, fullUrl: href };
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "";

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: baseUrl || undefined,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: baseUrl ? `${baseUrl}${item.fullUrl}` : undefined,
      })),
    ],
  };

  return (
    <>
      <nav
        aria-label="Fil d'Ariane"
        className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground sm:text-sm",
          className
        )}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sr-only">Accueil</span>
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span
              key={item.fullUrl}
              className="inline-flex items-center gap-1"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              {isLast || !item.href ? (
                <span className="font-semibold text-foreground truncate max-w-[10rem] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors truncate max-w-[8rem] sm:max-w-xs"
                >
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbList),
        }}
      />
    </>
  );
}

