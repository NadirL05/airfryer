import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Génère l'URL du proxy d'images (/api/image) pour les images externes.
 * Évite le hotlinking et permet le cache.
 */
export function proxyImageUrl(url: string | null | undefined, width?: number): string {
  if (!url || typeof url !== "string") {
    return "";
  }
  try {
    const encoded = encodeURIComponent(url);
    const w = width != null ? `&w=${width}` : "";
    return `/api/image?url=${encoded}${w}`;
  } catch {
    return url;
  }
}
