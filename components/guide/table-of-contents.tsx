 "use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

interface TableOfContentsProps {
  items: TocItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop
          );

        if (visibleHeadings[0]) {
          setActiveId(visibleHeadings[0].target.id);
        }
      },
      {
        rootMargin: "0px 0px -65% 0px",
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <aside
      aria-label="Sommaire de l'article"
      className={cn(
        "rounded-xl border bg-card/60 p-4 text-xs text-muted-foreground shadow-sm backdrop-blur",
        "space-y-3",
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
        Sommaire
      </p>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const el = document.getElementById(item.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className={cn(
                "block w-full border-l-2 border-transparent pl-2 text-left text-[12px] leading-snug transition-colors",
                "hover:text-foreground",
                item.level === 3 && "pl-4",
                isActive
                  ? "border-primary font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.text}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

