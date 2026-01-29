"use client";

import { useState, useEffect } from "react";

/**
 * Returns true when the user has scrolled past the given threshold (in pixels).
 */
export function useScroll(threshold: number): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    handleScroll(); // initial check (e.g. on load with hash)
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}
