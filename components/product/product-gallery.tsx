"use client";

import { useState } from "react";
import { cn, proxyImageUrl } from "@/lib/utils";
import { Package } from "lucide-react";

interface ProductGalleryProps {
  mainImage: string | null;
  galleryImages: string[] | null;
}

export function ProductGallery({
  mainImage,
  galleryImages,
}: ProductGalleryProps) {
  // Initialize state with mainImage
  const [activeImage, setActiveImage] = useState<string | null>(mainImage);

  // Combine all images
  const allImages = mainImage
    ? [mainImage, ...(galleryImages || [])]
    : galleryImages || [];

  // If no images at all, show placeholder
  if (allImages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted">
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-24 w-24 text-muted-foreground/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main View - Large square container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted">
        {activeImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={proxyImageUrl(activeImage, 800)}
            alt="Produit"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-24 w-24 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Thumbnails - Scrollable row */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
              <button
              key={index}
              onClick={() => setActiveImage(image)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                activeImage === image
                  ? "border-primary ring-2 ring-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxyImageUrl(image, 160)}
                alt={`Vue ${index + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
