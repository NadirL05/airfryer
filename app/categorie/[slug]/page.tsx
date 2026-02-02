import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";

// Catégories avec des produits (compact est vide - aucun produit < 3L)
const VALID_CATEGORIES = ["family", "xxl", "oven", "dehydrator"];

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
  getCategoryBySlug,
  getFilteredProducts,
  getBrands,
  type ProductFilterOptions,
} from "@/lib/supabase/queries";

// ============================================
// Types
// ============================================

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface BrandMap {
  [slug: string]: { id: string; name: string };
}

// ============================================
// Helpers
// ============================================

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
  brandMap: BrandMap
): ProductFilterOptions {
  const minPriceParam = getParam(sp, "min_price");
  const maxPriceParam = getParam(sp, "max_price");
  const brandsParam = getParam(sp, "brands");
  const featuresParam = getParam(sp, "features");
  const sortParam = getParam(sp, "sort");
  const pageParam = getParam(sp, "page");

  const brandSlugs = brandsParam
    ? brandsParam.split(",").filter(Boolean)
    : undefined;
  const brandIds = brandSlugs
    ?.map((slug) => brandMap[slug]?.id)
    .filter((id): id is string => !!id);

  return {
    minPrice: minPriceParam ? Number(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    brandIds: brandIds && brandIds.length > 0 ? brandIds : undefined,
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
  if (getParam(sp, "min_price") || getParam(sp, "max_price")) count++;
  if (getParam(sp, "brands")) count++;
  if (getParam(sp, "features")) count++;
  return count;
}

function formatCategoryTitle(slug: string): string {
  const titles: Record<string, string> = {
    compact: "Air Fryers Compacts (< 3L)",
    family: "Air Fryers Familiaux (3-5L)",
    xxl: "Air Fryers XXL (> 5L)",
    oven: "Fours Air Fryer",
    dehydrator: "Déshydrateurs",
  };
  return titles[slug] || "Air Fryers";
}

function formatCategoryDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    compact: "Parfaits pour les personnes seules ou les couples. Capacité de 1 à 3 litres, idéaux pour les petits espaces.",
    family: "La taille idéale pour 3 à 4 personnes. Capacité de 3 à 5 litres pour des repas familiaux complets.",
    xxl: "Pour les grandes familles ou ceux qui aiment recevoir. Plus de 5 litres de capacité pour cuisiner en grande quantité.",
    oven: "Combinez air fryer et four traditionnel. Polyvalents et multifonctions pour une cuisine variée.",
    dehydrator: "Idéals pour déshydrater fruits, légumes et viandes. Fonctionnalité spécialisée pour les amateurs de snacks sains.",
  };
  return descriptions[slug] || "Découvrez notre sélection d'air fryers pour trouver le modèle parfait.";
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const categoryData = await getCategoryBySlug(slug);
  const categoryTitle = categoryData?.name ?? formatCategoryTitle(slug);

  const title = `${categoryTitle} - Comparatif 2026 | AirFryer Deal`;
  const description = categoryData?.description ?? formatCategoryDescription(slug);

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

// ============================================
// Product Grid Loader
// ============================================

interface ProductGridLoaderProps {
  categorySlug: string;
  filters: ProductFilterOptions;
}

async function ProductGridLoader({ categorySlug, filters }: ProductGridLoaderProps) {
  const { products, totalCount, page, totalPages } = await getFilteredProducts(
    categorySlug,
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

// ============================================
// Main Page
// ============================================

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  
  // Rediriger les catégories vides vers une catégorie valide
  if (slug === "compact") {
    redirect("/categorie/family");
  }
  
  const sp = await searchParams;

  const [categoryData, brandsData] = await Promise.all([
    getCategoryBySlug(slug),
    getBrands(50),
  ]);

  const brandMap: BrandMap = {};
  brandsData.forEach((b) => {
    brandMap[b.slug] = { id: b.id, name: b.name };
  });

  const filters = parseFiltersFromSearchParams(sp, brandMap);
  const activeFilterCount = countActiveFilters(sp);

  const title = categoryData?.name ?? formatCategoryTitle(slug);
  const description = categoryData?.description ?? formatCategoryDescription(slug);

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
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        <div className="hidden shrink-0 lg:block">
          <SortDropdown />
        </div>
      </header>

      {/* Mobile Header */}
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

      {/* Main Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">{sidebarContent}</div>
        </aside>

        <section className="lg:col-span-9">
          <Suspense key={suspenseKey} fallback={<ProductGridSkeleton count={12} />}>
            <ProductGridLoader categorySlug={slug} filters={filters} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
