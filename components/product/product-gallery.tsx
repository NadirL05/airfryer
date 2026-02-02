"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
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
          <Image
            src={activeImage}
            alt="Produit"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            priority
            unoptimized
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
              <Image
                src={image}
                alt={`Vue ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
