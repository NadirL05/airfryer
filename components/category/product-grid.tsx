import {
  ProductCard,
  type ProductCardProps,
} from "@/components/product/product-card";

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
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
