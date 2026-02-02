import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";
import { proxyImageUrl } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url?: string | null;
}

interface BrandsSectionProps {
  brands: Brand[];
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-background-light">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Nos marques{" "}
          <span className="text-primary">coup de cœur</span>
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {brands.map((brand) => {
            const CardContent = (
              <Card className="group h-full p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50">
                <div className="flex flex-col items-center justify-center space-y-4">
                  {/* Logo */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                    {brand.logo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={proxyImageUrl(brand.logo_url, 160)}
                        alt={brand.name}
                        className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Brand Name */}
                  <h3 className="text-center text-sm font-semibold group-hover:text-primary transition-colors">
                    {brand.name}
                  </h3>
                </div>
              </Card>
            );

            return brand.website_url ? (
              <a
                key={brand.id}
                href={brand.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {CardContent}
              </a>
            ) : (
              <Link key={brand.id} href={`/marque/${brand.slug}`}>
                {CardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
