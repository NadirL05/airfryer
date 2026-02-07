"use client";

import { useRef, useEffect, type ReactNode } from "react";
import gsap from "gsap";

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  /** Délai entre chaque enfant (secondes) */
  stagger?: number;
  /** Durée de l'animation (secondes) */
  duration?: number;
  /** Décalage vertical initial (px) */
  y?: number;
}

/**
 * Anime l'apparition des enfants en fondu + slide up avec décalage (stagger).
 * Style épuré type Apple.
 */
export function StaggerReveal({
  children,
  className,
  stagger = 0.06,
  duration = 0.45,
  y = 16,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const els = Array.from(container.children);
    if (els.length === 0) return;

    gsap.fromTo(
      els,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: "power2.out",
        overwrite: true,
      }
    );
  }, [stagger, duration, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
