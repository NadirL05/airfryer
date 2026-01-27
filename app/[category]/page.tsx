import { Suspense } from "react";
import type { Metadata } from "next";
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
  getCategoryBySlug,
  getFilteredProducts,
  getBrands,
  type ProductFilterOptions,
} from "@/lib/supabase/queries";

// ============================================
// Types
// ============================================

interface PageProps {
  params: Promise<{ category: string }>;
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

/**
 * Parse search params and map brand slugs to UUIDs
 */
function parseFiltersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
  brandMap: BrandMap
): ProductFilterOptions {
  const minPriceParam = getParam(sp, "min_price");
  const maxPriceParam = getParam(sp, "max_price");
  const brandsParam = getParam(sp, "brands");
  const capacityParam = getParam(sp, "capacity");
  const featuresParam = getParam(sp, "features");
  const sortParam = getParam(sp, "sort");
  const pageParam = getParam(sp, "page");

  // Convert brand slugs to UUIDs
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
    brands: brandSlugs, // Keep slugs for fallback
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
  if (getParam(sp, "min_price") || getParam(sp, "max_price")) count++;
  if (getParam(sp, "brands")) count++;
  if (getParam(sp, "capacity")) count++;
  if (getParam(sp, "features")) count++;
  return count;
}

function formatCategoryTitle(slug: string): string {
  const titles: Record<string, string> = {
    compact: "Air Fryers Compacts",
    family: "Air Fryers Familiaux",
    xxl: "Air Fryers XXL",
    oven: "Fours Air Fryer",
    dehydrator: "Déshydrateurs",
    all: "Tous les Air Fryers",
  };
  return titles[slug] || "Air Fryers";
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// Dynamic SEO Metadata
// ============================================

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const sp = await searchParams;

  // Fetch category and brands for metadata
  const [categoryData, brandsData] = await Promise.all([
    getCategoryBySlug(category),
    getBrands(50),
  ]);

  // Build brand map for name lookup
  const brandMap: BrandMap = {};
  brandsData.forEach((b) => {
    brandMap[b.slug] = { id: b.id, name: b.name };
  });

  // Base title
  const categoryTitle = categoryData?.name ?? formatCategoryTitle(category);

  // Build dynamic title parts based on filters
  const titleParts: string[] = [categoryTitle];

  // Add brand names to title
  const brandsParam = getParam(sp, "brands");
  if (brandsParam) {
    const brandSlugs = brandsParam.split(",").filter(Boolean);
    const brandNames = brandSlugs
      .map((slug) => brandMap[slug]?.name || capitalize(slug))
      .slice(0, 2); // Max 2 brands in title

    if (brandNames.length > 0) {
      titleParts.push(brandNames.join(" & "));
    }
  }

  // Add capacity to title
  const capacityParam = getParam(sp, "capacity");
  if (capacityParam) {
    const capacityLabels: Record<string, string> = {
      compact: "Compacts",
      family: "Familiaux",
      xxl: "XXL",
    };
    const capacityLabel = capacityLabels[capacityParam];
    if (capacityLabel && !categoryTitle.toLowerCase().includes(capacityParam)) {
      titleParts.push(capacityLabel);
    }
  }

  // Add price range to description
  const minPrice = getParam(sp, "min_price");
  const maxPrice = getParam(sp, "max_price");
  let priceInfo = "";
  if (minPrice || maxPrice) {
    if (minPrice && maxPrice) {
      priceInfo = ` de ${minPrice}€ à ${maxPrice}€`;
    } else if (minPrice) {
      priceInfo = ` à partir de ${minPrice}€`;
    } else if (maxPrice) {
      priceInfo = ` jusqu'à ${maxPrice}€`;
    }
  }

  // Build final title
  const title = `${titleParts.join(" ")} | AirFryer Deal`;

  // Build description
  const baseDescription =
    categoryData?.description ??
    `Découvrez notre sélection d'air fryers ${categoryTitle.toLowerCase()}`;

  const description = `${baseDescription}${priceInfo}. Comparez les prix, les notes et les fonctionnalités pour trouver le meilleur air fryer.`;

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
// Product Grid Server Component (async)
// ============================================

interface ProductGridLoaderProps {
  categorySlug: string;
  filters: ProductFilterOptions;
}

async function ProductGridLoader({
  categorySlug,
  filters,
}: ProductGridLoaderProps) {
  const { products, totalCount, page, totalPages } = await getFilteredProducts(
    categorySlug,
    filters
  );

  if (products.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="space-y-6">
      {/* Results count */}
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

      {/* Product Grid - Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <ProductGrid products={products} />

      {/* Pagination placeholder - can be expanded */}
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
// Main Page Component
// ============================================

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  // Await params and searchParams (Next.js 16 requirement)
  const { category } = await params;
  const sp = await searchParams;

  // Fetch category metadata and all brands in parallel
  const [categoryData, brandsData] = await Promise.all([
    getCategoryBySlug(category),
    getBrands(50), // Get up to 50 brands for the filter
  ]);

  // Build brand map: slug -> { id, name }
  const brandMap: BrandMap = {};
  brandsData.forEach((b) => {
    brandMap[b.slug] = { id: b.id, name: b.name };
  });

  // Parse filters with brand slug -> UUID mapping
  const filters = parseFiltersFromSearchParams(sp, brandMap);
  const activeFilterCount = countActiveFilters(sp);

  // Page metadata
  const title = categoryData?.name ?? formatCategoryTitle(category);
  const description =
    categoryData?.description ??
    "Affinez votre recherche avec les filtres de prix, de marques, de capacité et de fonctions pour trouver l'air fryer idéal.";

  // Transform brands data to match FilterSidebar props
  const availableBrands: Brand[] = brandsData.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo_url: b.logo_url,
  }));

  // Create a unique key for Suspense based on searchParams
  const suspenseKey = JSON.stringify(sp);

  // Sidebar component (reused in desktop and mobile)
  const sidebarContent = (
    <FilterSidebar
      maxPriceGlobal={500}
      minPriceGlobal={0}
      availableBrands={availableBrands}
    />
  );

  return (
    <div className="container py-8 lg:py-12">
      {/* ===== Header with Title & Total Count ===== */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        {/* Desktop Sort Dropdown in Header */}
        <div className="hidden shrink-0 lg:block">
          <SortDropdown />
        </div>
      </header>

      {/* ===== Mobile Header: Filter Button + Sort ===== */}
      <div className="mt-6 flex items-center justify-between gap-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtres</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[320px] overflow-y-auto p-0 sm:w-[380px]"
          >
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="p-4">{sidebarContent}</div>
          </SheetContent>
        </Sheet>

        <SortDropdown />
      </div>

      {/* ===== Main Layout Grid ===== */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Sidebar - Desktop Only (Left Column) */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">{sidebarContent}</div>
        </aside>

        {/* Results Section (Right Column) */}
        <section className="lg:col-span-9">
          {/* Product Grid with Suspense for streaming */}
          <Suspense
            key={suspenseKey}
            fallback={<ProductGridSkeleton count={12} />}
          >
            <ProductGridLoader categorySlug={category} filters={filters} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
