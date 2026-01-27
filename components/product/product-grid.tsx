import { ProductCard, type ProductCardProps } from "@/components/product/product-card";

type GridProduct = ProductCardProps & {
  brand_name?: string;
  brand_slug?: string;
};

interface ProductGridProps {
  products: GridProduct[];
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Grid classes based on columns prop
  // Default: 2 cols mobile -> 3 cols tablet -> 4 cols desktop
  const gridClasses = {
    2: "grid gap-4 grid-cols-1 sm:grid-cols-2",
    3: "grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3",
    4: "grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={gridClasses[columns]}>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}

