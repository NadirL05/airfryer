"use client";

import {
  ProductCard,
  type ProductCardProps,
} from "@/components/product/product-card";
import { StaggerReveal } from "@/components/ui/stagger-reveal";

// ============================================
// Types
// ============================================

type GridProduct = ProductCardProps & {
  brand_name?: string | null;
  brand_slug?: string | null;
  type?: string | null;
  has_dual_zone?: boolean;
  has_app?: boolean;
};

interface ProductGridProps {
  products: GridProduct[];
}

// ============================================
// Component
// ============================================

export function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <StaggerReveal
      className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      stagger={0.06}
      duration={0.42}
      y={14}
    >
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </StaggerReveal>
  );
}
