"use client";

import { useState, useMemo } from "react";
import { ProductFilters, getDefaultFilterState, type ProductFilterState } from "@/components/product/product-filters";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Search, RotateCcw, Package } from "lucide-react";
import type { HomeListingProduct } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

interface ProductGridWithFiltersProps {
  products: HomeListingProduct[];
}

function filterProducts(
  products: HomeListingProduct[],
  state: ProductFilterState,
  minPrice: number,
  maxPrice: number
): HomeListingProduct[] {
  const searchLower = state.searchQuery.trim().toLowerCase();
  const [priceMin, priceMax] = state.priceRange;
  return products.filter((p) => {
    if (searchLower && !p.title.toLowerCase().includes(searchLower)) return false;
    if (p.price < priceMin || p.price > priceMax) return false;
    if (state.selectedBrands.length > 0 && p.brand_name && !state.selectedBrands.includes(p.brand_name)) return false;
    if (state.capacity !== "all") {
      const cap = p.capacity_liters;
      if (cap == null) return false;
      if (state.capacity === "small" && cap >= 4) return false;
      if (state.capacity === "xl" && (cap < 4 || cap > 6)) return false;
      if (state.capacity === "xxl" && cap <= 6) return false;
    }
    return true;
  });
}

export function ProductGridWithFilters({ products }: ProductGridWithFiltersProps) {
  const brands = useMemo(() => {
    const names = products.map((p) => p.brand_name).filter((n): n is string => Boolean(n));
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const minPrice = 0;
  const maxPrice = useMemo(() => {
    const prices = products.map((p) => p.price).filter((n) => n > 0);
    if (prices.length === 0) return 300;
    return Math.min(500, Math.max(300, Math.ceil(Math.max(...prices) / 50) * 50));
  }, [products]);

  const [filterState, setFilterState] = useState<ProductFilterState>(() =>
    getDefaultFilterState(minPrice, maxPrice)
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredProducts = useMemo(
    () => filterProducts(products, filterState, minPrice, maxPrice),
    [products, filterState, minPrice, maxPrice]
  );

  const handleReset = () => {
    setFilterState(getDefaultFilterState(minPrice, maxPrice));
    setSheetOpen(false);
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        {/* Header : titre + barre de recherche (toujours visible) + bouton Filtrer (mobile) */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                Tous les air fryers
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Filtrez par budget, marque et capacité.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un modèle..."
                value={filterState.searchQuery}
                onChange={(e) => setFilterState((s) => ({ ...s, searchQuery: e.target.value }))}
                className="pl-9 bg-background"
                aria-label="Rechercher un modèle"
              />
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="default" className="gap-2 shrink-0">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtrer
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[min(320px,100vw)] overflow-y-auto">
                  <SheetTitle className="sr-only">Filtres</SheetTitle>
                  <div className="mt-6">
                    <ProductFilters
                      brands={brands}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      filterState={filterState}
                      onFilterChange={setFilterState}
                      resultCount={filteredProducts.length}
                      onReset={handleReset}
                      showSearchField={false}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar desktop : filtres (Budget, Marques, Capacité) — recherche déjà en haut */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-card p-4 shadow-sm">
              <ProductFilters
                brands={brands}
                minPrice={minPrice}
                maxPrice={maxPrice}
                filterState={filterState}
                onFilterChange={setFilterState}
                resultCount={filteredProducts.length}
                onReset={handleReset}
                showSearchField={false}
              />
            </div>
          </aside>

          {/* Grille produits + nombre de résultats */}
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between rounded-lg border border-transparent bg-muted/30 px-4 py-2">
              <p className="text-sm font-medium text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredProducts.length}</span>
                {" "}produit{filteredProducts.length !== 1 ? "s" : ""} trouvé{filteredProducts.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-muted/20 px-6 py-16 text-center"
                )}
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Aucun air fryer ne correspond à vos critères
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Élargissez le budget, changez la marque ou la capacité, ou réinitialisez les filtres.
                </p>
                <Button
                  variant="default"
                  size="lg"
                  className="mt-6 gap-2"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    slug={p.slug}
                    image_url={p.image_url}
                    price={p.price}
                    score={p.score}
                    capacity={p.capacity}
                    capacity_liters={p.capacity_liters}
                    brand_name={p.brand_name}
                    has_window={p.has_window}
                    affiliate_url={p.affiliate_url}
                    badge_text={p.badge_text}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
