"use client";

interface ProductJsonLdProps {
  // We keep this generic to avoid tight coupling; just require the fields we use.
  product: {
    name: string;
    short_description?: string | null;
    main_image_url?: string | null;
    brand_name?: string | null;
    // Numeric fields – we handle null/undefined gracefully
    rating_overall?: number | null;
    min_price?: number | null;
    max_price?: number | null;
  };
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  if (!product?.name) return null;

  const {
    name,
    short_description,
    main_image_url,
    brand_name,
    rating_overall,
    min_price,
    max_price,
  } = product;

  const price = min_price ?? max_price ?? null;
  const ratingValue =
    typeof rating_overall === "number" && !Number.isNaN(rating_overall)
      ? Number(rating_overall.toFixed(1))
      : undefined;

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: main_image_url || undefined,
    description: short_description || undefined,
    brand: brand_name
      ? {
          "@type": "Brand",
          name: brand_name,
        }
      : undefined,
  };

  if (ratingValue !== undefined) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount: 100,
    };
  }

  if (price !== null && !Number.isNaN(price)) {
    jsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "EUR",
      price,
      availability: "https://schema.org/InStock",
    };
  }

  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a plain JSON string
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

