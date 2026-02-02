import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Proxy image URL via notre API pour contourner le hotlinking (Amazon, etc.)
 * @param url - URL originale de l'image
 * @param _width - Ignoré (réservé pour compatibilité)
 * @returns URL proxée (/api/image?url=...)
 */
export function proxyImageUrl(url: string | null | undefined, _width?: number): string {
  if (!url) return "";

  // URLs locales ou data: → retourner telles quelles
  if (url.startsWith("/") || url.startsWith("data:")) {
    return url;
  }

  // Si déjà notre proxy → retourner tel quel
  if (url.includes("/api/image?")) {
    return url;
  }

  return `/api/image?url=${encodeURIComponent(url)}`;
}
