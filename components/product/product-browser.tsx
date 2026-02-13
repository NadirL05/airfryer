"use client";

import { useState, useMemo, useCallback } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, RotateCcw, SearchX, ChevronDown } from "lucide-react";
import type { HomeListingProduct } from "@/lib/supabase/queries";

const PRICE_DEFAULT: [number, number] = [0, 300];
export type SortOption = "rating" | "price-asc" | "price-desc";

interface ProductBrowserProps {
  initialProducts: HomeListingProduct[];
}

export function ProductBrowser({ initialProducts }: ProductBrowserProps) {
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>(PRICE_DEFAULT);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("rating");
  const [sheetOpen, setSheetOpen] = useState(false);

  const maxPriceBound = useMemo(() => {
    const prices = initialProducts.map((p) => p.price).filter((n) => n > 0);
    if (prices.length === 0) return 300;
    return Math.min(500, Math.max(300, Math.ceil(Math.max(...prices) / 50) * 50));
  }, [initialProducts]);

  const filteredAndSorted = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    let list = initialProducts.filter((p) => {
      if (searchLower && !p.title.toLowerCase().includes(searchLower)) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (selectedBrands.length > 0 && p.brand_name && !selectedBrands.includes(p.brand_name)) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return list;
  }, [initialProducts, search, priceRange, selectedBrands, sort]);

  const brandsWithCount = useMemo(() => {
    const map = new Map<string, number>();
    initialProducts.forEach((p) => {
      if (!p.brand_name) return;
      const name = p.brand_name;
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [initialProducts]);

  const hasActiveFilters =
    search.trim() !== "" ||
    priceRange[0] !== PRICE_DEFAULT[0] ||
    priceRange[1] !== PRICE_DEFAULT[1] ||
    selectedBrands.length > 0;

  const handleReset = useCallback(() => {
    setSearch("");
    setPriceRange(PRICE_DEFAULT);
    setSelectedBrands([]);
    setSort("rating");
    setSheetOpen(false);
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }, []);

  const sortLabel =
    sort === "rating" ? "Note" : sort === "price-asc" ? "Prix croissant" : "Prix décroissant";

  const sidebarContent = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Recherche</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un modèle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Rechercher"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Prix (€)</Label>
        <Slider
          min={0}
          max={maxPriceBound}
          step={10}
          value={priceRange}
          onValueChange={(v) => setPriceRange([v[0] ?? 0, v[1] ?? maxPriceBound])}
          className="py-4"
        />
        <p className="text-xs text-muted-foreground">
          {priceRange[0]}€ – {priceRange[1]}€
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Marques</Label>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {brandsWithCount.map(([brand, count]) => (
            <label
              key={brand}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                  aria-label={brand}
                />
                <span>{brand}</span>
              </div>
              <span className="text-xs text-muted-foreground">({count})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Trier par</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {sortLabel}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
            <DropdownMenuItem onClick={() => setSort("rating")}>Note</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort("price-asc")}>Prix croissant</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort("price-desc")}>Prix décroissant</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Réinitialiser
        </Button>
      )}
    </div>
  );

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Tous les air fryers
          </h2>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 max-w-xs"
              />
            </div>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="default" className="gap-2 relative">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtres
                  {hasActiveFilters && (
                    <Badge
                      variant="secondary"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(320px,100vw)] overflow-y-auto">
                <SheetTitle className="sr-only">Filtres</SheetTitle>
                <div className="mt-6">{sidebarContent}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-card p-4 shadow-sm dark:border-slate-800">
              {sidebarContent}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 rounded-lg bg-muted/30 px-4 py-2">
              <p className="text-sm font-medium text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredAndSorted.length}</span> result
                {filteredAndSorted.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredAndSorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-muted/20 px-6 py-16 text-center dark:border-slate-700">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <SearchX className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Aucun Airfryer ne correspond à vos critères
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Modifiez les filtres ou réinitialisez pour tout afficher.
                </p>
                <Button variant="default" size="lg" className="mt-6 gap-2" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAndSorted.map((p, i) => (
                  <li
                    key={p.id}
                    className="animate-in fade-in-0 duration-300"
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  >
                    <ProductCard
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
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
