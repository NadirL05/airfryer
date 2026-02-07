"use client";

import { useState, useMemo } from "react";
import { ProductFilters, defaultFilterState, type ProductFilterState } from "@/components/product/product-filters";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Search } from "lucide-react";
import type { HomeListingProduct } from "@/lib/supabase/queries";

interface ProductListingSectionProps {
  products: HomeListingProduct[];
}

function filterProducts(
  products: HomeListingProduct[],
  state: ProductFilterState
): HomeListingProduct[] {
  const searchLower = state.search.trim().toLowerCase();
  return products.filter((p) => {
    if (searchLower && !p.title.toLowerCase().includes(searchLower)) return false;
    if (p.price < state.priceMin || p.price > state.priceMax) return false;
    if (state.selectedBrands.length > 0 && p.brand_name && !state.selectedBrands.includes(p.brand_name)) return false;
    if (state.capacity) {
      const cap = p.capacity_liters;
      if (cap == null) return false;
      if (state.capacity === "solo" && cap >= 4) return false;
      if (state.capacity === "family" && (cap < 4 || cap > 7)) return false;
      if (state.capacity === "xxl" && cap <= 7) return false;
    }
    if (state.doubleBac && !p.has_dual_zone) return false;
    if (state.fenetre && !p.has_window) return false;
    if (state.app && !p.has_app) return false;
    return true;
  });
}

export function ProductListingSection({ products }: ProductListingSectionProps) {
  const [filterState, setFilterState] = useState<ProductFilterState>(defaultFilterState);
  const [sheetOpen, setSheetOpen] = useState(false);

  const availableBrands = useMemo(() => {
    const names = products.map((p) => p.brand_name).filter((n): n is string => Boolean(n));
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(
    () => filterProducts(products, filterState),
    [products, filterState]
  );

  const handleReset = () => {
    setFilterState(defaultFilterState);
    setSheetOpen(false);
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        {/* Titre + bouton Filtrer mobile */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Tous les air fryers
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Filtrez par budget, marque, capacité et options.
            </p>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="default" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtrer
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(320px,100vw)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ProductFilters
                    filterState={filterState}
                    onFilterChange={setFilterState}
                    availableBrands={availableBrands}
                    resultCount={filteredProducts.length}
                    onReset={handleReset}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar desktop - fixe à gauche */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <ProductFilters
                filterState={filterState}
                onFilterChange={setFilterState}
                availableBrands={availableBrands}
                resultCount={filteredProducts.length}
                onReset={handleReset}
              />
            </div>
          </aside>

          {/* Grille produits */}
          <div className="min-w-0 flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-muted/30 px-6 py-16 text-center">
                <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">
                  Aucun airfryer ne correspond à vos critères
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Essayez d&apos;élargir le budget, de changer la capacité ou de réinitialiser les filtres.
                </p>
                <Button
                  variant="default"
                  size="lg"
                  className="mt-6"
                  onClick={handleReset}
                >
                  Réinitialiser les filtres
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
