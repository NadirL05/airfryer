"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/** État des filtres remonté au parent via onFilterChange */
export interface ProductFilterState {
  searchQuery: string;
  selectedBrands: string[];
  priceRange: [number, number];
  capacity: "all" | "small" | "xl" | "xxl";
}

export function getDefaultFilterState(
  minPrice: number,
  maxPrice: number
): ProductFilterState {
  return {
    searchQuery: "",
    selectedBrands: [],
    priceRange: [minPrice, maxPrice],
    capacity: "all",
  };
}

interface ProductFiltersProps {
  brands: string[];
  minPrice: number;
  maxPrice: number;
  filterState: ProductFilterState;
  onFilterChange: (state: ProductFilterState) => void;
  resultCount: number;
  onReset?: () => void;
  /** Si false, masque le champ Recherche (utile quand la recherche est dans le header). */
  showSearchField?: boolean;
  className?: string;
}

export function ProductFilters({
  brands,
  minPrice,
  maxPrice,
  filterState,
  onFilterChange,
  resultCount,
  onReset,
  showSearchField = true,
  className,
}: ProductFiltersProps) {
  const update = useCallback(
    (patch: Partial<ProductFilterState>) => {
      onFilterChange({ ...filterState, ...patch });
    },
    [filterState, onFilterChange]
  );

  const handleSearch = (value: string) => update({ searchQuery: value });
  const handlePriceRange = (value: number[]) => {
    const [min, max] = value;
    update({ priceRange: [min ?? minPrice, max ?? maxPrice] });
  };
  const toggleBrand = (brand: string) => {
    const next = filterState.selectedBrands.includes(brand)
      ? filterState.selectedBrands.filter((b) => b !== brand)
      : [...filterState.selectedBrands, brand];
    update({ selectedBrands: next });
  };
  const handleCapacity = (value: string) =>
    update({ capacity: value as ProductFilterState["capacity"] });

  const hasActiveFilters =
    filterState.searchQuery.trim() !== "" ||
    filterState.priceRange[0] > minPrice ||
    filterState.priceRange[1] < maxPrice ||
    filterState.selectedBrands.length > 0 ||
    filterState.capacity !== "all";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          {resultCount} résultat{resultCount !== 1 ? "s" : ""}
        </span>
        {hasActiveFilters && onReset && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser
          </Button>
        )}
      </div>

      {showSearchField && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un modèle..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              aria-label="Rechercher un modèle"
            />
          </div>
        </div>
      )}

      <Accordion type="multiple" defaultValue={["budget", "marque", "capacite"]} className="w-full">
        <AccordionItem value="budget" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Budget
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-1">
              <Slider
                min={minPrice}
                max={maxPrice}
                step={5}
                value={filterState.priceRange}
                onValueChange={handlePriceRange}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">
                {filterState.priceRange[0]}€ – {filterState.priceRange[1]}€
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="marque" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Marque
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2 pt-1 max-h-48 overflow-y-auto">
              {brands.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucune marque</p>
              ) : (
                brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={filterState.selectedBrands.includes(brand)}
                      onCheckedChange={() => toggleBrand(brand)}
                      aria-label={`Marque ${brand}`}
                    />
                    <span>{brand}</span>
                  </label>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="capacite" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Capacité
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={filterState.capacity}
              onValueChange={handleCapacity}
              className="grid gap-2 pt-1"
            >
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <RadioGroupItem value="all" id="cap-all" />
                <span>Toutes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <RadioGroupItem value="small" id="cap-small" />
                <span>Solo (&lt; 4 L)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <RadioGroupItem value="xl" id="cap-xl" />
                <span>Famille (4 – 6 L)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <RadioGroupItem value="xxl" id="cap-xxl" />
                <span>XXL (&gt; 6 L)</span>
              </label>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
