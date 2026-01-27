import { ProductCard } from "@/components/product/product-card";
import { ProductCardProps } from "@/components/product/product-card";

interface LatestTestsSectionProps {
  products: ProductCardProps[];
}

export function LatestTestsSection({ products }: LatestTestsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Nos{" "}
          <span className="text-primary">derniers tests</span>
        </h2>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
