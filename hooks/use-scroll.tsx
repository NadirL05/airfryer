"use client";

import { useEffect, useState } from "react";

/**
 * Retourne true si la page a été scrollée au-delà du seuil (en px).
 */
export function useScroll(thresholdPx: number): boolean {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const check = () => setPassed(window.scrollY > thresholdPx);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [thresholdPx]);

  return passed;
}
