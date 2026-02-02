"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
}

export interface FilterSidebarProps {
  maxPriceGlobal?: number;
  minPriceGlobal?: number;
  availableBrands?: Brand[];
}

// ============================================
// Constants
// ============================================

// Note: "compact" masqué car aucun produit < 3L actuellement
const CAPACITY_OPTIONS = [
  { label: "Familial", value: "family", description: "3-5L" },
  { label: "XXL", value: "xxl", description: "> 5L" },
] as const;

const FEATURE_OPTIONS = [
  { label: "Double Zone", value: "dual_zone", key: "has_dual_zone" },
  { label: "App Connectée", value: "app", key: "has_app" },
  { label: "Lave-vaisselle", value: "dishwasher_safe", key: "dishwasher_safe" },
  { label: "Rôtissoire", value: "rotisserie", key: "has_rotisserie" },
  { label: "Déshydratation", value: "dehydrator", key: "has_dehydrator" },
] as const;

// ============================================
// Component
// ============================================

export function FilterSidebar({
  maxPriceGlobal = 500,
  minPriceGlobal = 0,
  availableBrands = [],
}: FilterSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const {
    priceRange,
    setPriceRange,
    selectedBrands,
    toggleBrand,
    selectedFeatures,
    toggleFeature,
    resetFilters,
    hasActiveFilters,
  } = useUrlFilters({
    defaultMinPrice: minPriceGlobal,
    defaultMaxPrice: maxPriceGlobal,
  });

  // Détecter la catégorie actuelle depuis l'URL
  const currentCategory = pathname.includes("/categorie/")
    ? pathname.split("/categorie/")[1]?.split("?")[0] || null
    : null;

  // Rediriger vers la bonne page de catégorie au lieu de filtrer
  const handleCapacityChange = (value: string) => {
    if (value && value !== currentCategory) {
      router.push(`/categorie/${value}`);
    }
  };

  const [minPrice, maxPrice] = priceRange;

  // -------------------------
  // Handlers
  // -------------------------

  const handleSliderChange = (values: number[]) => {
    if (values.length === 2) {
      setPriceRange([values[0], values[1]]);
    }
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || minPriceGlobal;
    const clampedValue = Math.max(
      minPriceGlobal,
      Math.min(value, maxPrice - 10)
    );
    setPriceRange([clampedValue, maxPrice]);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || maxPriceGlobal;
    const clampedValue = Math.min(
      maxPriceGlobal,
      Math.max(value, minPrice + 10)
    );
    setPriceRange([minPrice, clampedValue]);
  };

  // -------------------------
  // Render
  // -------------------------

  return (
    <aside className="w-full rounded-xl border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Filtres</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Accordion Sections */}
      <Accordion
        type="multiple"
        defaultValue={["prix", "marques", "capacite", "fonctions"]}
        className="px-4"
      >
        {/* ===== Prix ===== */}
        <AccordionItem value="prix">
          <AccordionTrigger className="text-sm font-medium">
            Prix
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {/* Dual Thumb Slider */}
              <Slider
                value={[minPrice, maxPrice]}
                min={minPriceGlobal}
                max={maxPriceGlobal}
                step={10}
                onValueChange={handleSliderChange}
                className="w-full"
              />

              {/* Price Labels */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{minPriceGlobal} €</span>
                <span>{maxPriceGlobal} €</span>
              </div>

              {/* Manual Input Fields */}
              <div className="flex items-center gap-3">
                <div className="flex flex-1 items-center gap-1.5 rounded-md border bg-background px-2 py-1.5">
                  <span className="text-xs text-muted-foreground">Min</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={handleMinInputChange}
                    min={minPriceGlobal}
                    max={maxPrice - 10}
                    className="h-6 w-full bg-transparent text-right text-sm outline-none"
                  />
                  <span className="text-xs text-muted-foreground">€</span>
                </div>
                <span className="text-muted-foreground">—</span>
                <div className="flex flex-1 items-center gap-1.5 rounded-md border bg-background px-2 py-1.5">
                  <span className="text-xs text-muted-foreground">Max</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={handleMaxInputChange}
                    min={minPrice + 10}
                    max={maxPriceGlobal}
                    className="h-6 w-full bg-transparent text-right text-sm outline-none"
                  />
                  <span className="text-xs text-muted-foreground">€</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ===== Marques ===== */}
        <AccordionItem value="marques">
          <AccordionTrigger className="text-sm font-medium">
            Marques
            {selectedBrands.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                {selectedBrands.length}
              </span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {availableBrands.length > 0 ? (
                availableBrands.map((brand) => {
                  const isSelected = selectedBrands.includes(brand.slug);
                  return (
                    <label
                      key={brand.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleBrand(brand.slug)}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          isSelected && "font-medium text-foreground"
                        )}
                      >
                        {brand.name}
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className="py-2 text-xs text-muted-foreground">
                  Aucune marque disponible
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ===== Capacité ===== */}
        <AccordionItem value="capacite">
          <AccordionTrigger className="text-sm font-medium">
            Capacité
          </AccordionTrigger>
          <AccordionContent>
            <ToggleGroup
              type="single"
              value={currentCategory || ""}
              onValueChange={handleCapacityChange}
              className="flex w-full flex-wrap gap-2"
            >
              {CAPACITY_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1 min-w-[80px] flex-col gap-0.5 h-auto py-2",
                    currentCategory === option.value &&
                      "border-primary bg-primary/10 text-primary"
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {option.description}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </AccordionContent>
        </AccordionItem>

        {/* ===== Fonctions & Tech ===== */}
        <AccordionItem value="fonctions" className="border-b-0">
          <AccordionTrigger className="text-sm font-medium">
            Fonctions & Tech
            {selectedFeatures.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                {selectedFeatures.length}
              </span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {FEATURE_OPTIONS.map((feature) => {
                const isSelected = selectedFeatures.includes(feature.value);
                return (
                  <label
                    key={feature.value}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleFeature(feature.value)}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isSelected && "font-medium text-foreground"
                      )}
                    >
                      {feature.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
