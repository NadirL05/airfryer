import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import {
  FilterSidebar,
  type Brand,
} from "@/components/category/filter-sidebar";
import { ProductGrid } from "@/components/category/product-grid";
import { ProductGridSkeleton } from "@/components/category/product-grid-skeleton";
import { SortDropdown } from "@/components/category/sort-dropdown";
import { NoResults } from "@/components/category/no-results";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  getFilteredProducts,
  getBrands,
  type ProductFilterOptions,
} from "@/lib/supabase/queries";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Map price slugs to price ranges
const priceRanges: Record<string, { min: number; max: number; title: string; description: string }> = {
  "moins-50": {
    min: 0,
    max: 50,
    title: "Moins de 50€",
    description: "Les air fryers les plus abordables pour débuter sans se ruiner.",
  },
  "50-100": {
    min: 50,
    max: 100,
    title: "50€ - 100€",
    description: "Le meilleur rapport qualité-prix pour une entrée de gamme performante.",
  },
  "100-200": {
    min: 100,
    max: 200,
    title: "100€ - 200€",
    description: "Milieu de gamme avec des fonctionnalités avancées et une excellente qualité.",
  },
  "plus-200": {
    min: 200,
    max: 10000,
    title: "Plus de 200€",
    description: "Haut de gamme avec technologies innovantes et performances premium.",
  },
};

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseFiltersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
  minPrice: number,
  maxPrice: number
): ProductFilterOptions {
  const brandsParam = getParam(sp, "brands");
  const capacityParam = getParam(sp, "capacity");
  const featuresParam = getParam(sp, "features");
  const sortParam = getParam(sp, "sort");
  const pageParam = getParam(sp, "page");

  return {
    minPrice,
    maxPrice,
    capacity: capacityParam ? [capacityParam] : undefined,
    features: featuresParam
      ? featuresParam.split(",").filter(Boolean)
      : undefined,
    sortBy: (sortParam as ProductFilterOptions["sortBy"]) || "score_desc",
    page: pageParam ? Number(pageParam) : 1,
    pageSize: 20,
  };
}

function countActiveFilters(
  sp: Record<string, string | string[] | undefined>
): number {
  let count = 0;
  if (getParam(sp, "brands")) count++;
  if (getParam(sp, "capacity")) count++;
  if (getParam(sp, "features")) count++;
  return count;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const priceRange = priceRanges[slug];

  if (!priceRange) {
    return {
      title: "Prix non trouvé | AirFryer Deal",
    };
  }

  const title = `Air Fryers ${priceRange.title} - Comparatif 2026 | AirFryer Deal`;
  const description = priceRange.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

interface ProductGridLoaderProps {
  filters: ProductFilterOptions;
}

async function ProductGridLoader({ filters }: ProductGridLoaderProps) {
  const { products, totalCount, page, totalPages } = await getFilteredProducts(
    null, // No category filter, only price
    filters
  );

  if (products.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{totalCount}</span>{" "}
          produit{totalCount > 1 ? "s" : ""} trouvé{totalCount > 1 ? "s" : ""}
        </p>
        {totalPages > 1 && (
          <p>
            Page {page} sur {totalPages}
          </p>
        )}
      </div>

      <ProductGrid products={products} />

      {totalPages > 1 && (
        <div className="flex justify-center pt-8">
          <p className="text-sm text-muted-foreground">
            Affichage de {products.length} sur {totalCount} produits
          </p>
        </div>
      )}
    </div>
  );
}

export default async function PricePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const priceRange = priceRanges[slug];

  if (!priceRange) {
    notFound();
  }

  const [brandsData] = await Promise.all([getBrands(50)]);

  const filters = parseFiltersFromSearchParams(sp, priceRange.min, priceRange.max);
  const activeFilterCount = countActiveFilters(sp);

  const availableBrands: Brand[] = brandsData.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo_url: b.logo_url,
  }));

  const suspenseKey = JSON.stringify({ slug, ...sp });

  const sidebarContent = (
    <FilterSidebar
      maxPriceGlobal={500}
      minPriceGlobal={0}
      availableBrands={availableBrands}
    />
  );

  return (
    <div className="container py-8 lg:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Air Fryers {priceRange.title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {priceRange.description}
          </p>
        </div>

        <div className="hidden shrink-0 lg:block">
          <SortDropdown />
        </div>
      </header>

      <div className="mt-6 flex items-center justify-between gap-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtres</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] overflow-y-auto p-0 sm:w-[380px]">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="p-4">{sidebarContent}</div>
          </SheetContent>
        </Sheet>

        <SortDropdown />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">{sidebarContent}</div>
        </aside>

        <section className="lg:col-span-9">
          <Suspense key={suspenseKey} fallback={<ProductGridSkeleton count={12} />}>
            <ProductGridLoader filters={filters} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
