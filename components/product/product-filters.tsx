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

const PRICE_MAX = 300;

export interface ProductFilterState {
  search: string;
  priceMin: number;
  priceMax: number;
  selectedBrands: string[];
  capacity: "solo" | "family" | "xxl" | "";
  doubleBac: boolean;
  fenetre: boolean;
  app: boolean;
}

export const defaultFilterState: ProductFilterState = {
  search: "",
  priceMin: 0,
  priceMax: PRICE_MAX,
  selectedBrands: [],
  capacity: "",
  doubleBac: false,
  fenetre: false,
  app: false,
};

interface ProductFiltersProps {
  filterState: ProductFilterState;
  onFilterChange: (state: ProductFilterState) => void;
  availableBrands: string[];
  resultCount: number;
  onReset?: () => void;
  className?: string;
}

export function ProductFilters({
  filterState,
  onFilterChange,
  availableBrands,
  resultCount,
  onReset,
  className,
}: ProductFiltersProps) {
  const update = useCallback(
    (patch: Partial<ProductFilterState>) => {
      onFilterChange({ ...filterState, ...patch });
    },
    [filterState, onFilterChange]
  );

  const handleSearch = (value: string) => update({ search: value });
  const handlePriceRange = (value: number[]) => {
    const [min, max] = value;
    update({ priceMin: min ?? 0, priceMax: max ?? PRICE_MAX });
  };
  const toggleBrand = (brand: string) => {
    const next = filterState.selectedBrands.includes(brand)
      ? filterState.selectedBrands.filter((b) => b !== brand)
      : [...filterState.selectedBrands, brand];
    update({ selectedBrands: next });
  };
  const handleCapacity = (value: string) =>
    update({ capacity: value as ProductFilterState["capacity"] });
  const handleDoubleBac = (checked: boolean) => update({ doubleBac: checked });
  const handleFenetre = (checked: boolean) => update({ fenetre: checked });
  const handleApp = (checked: boolean) => update({ app: checked });

  const hasActiveFilters =
    filterState.search.trim() !== "" ||
    filterState.priceMin > 0 ||
    filterState.priceMax < PRICE_MAX ||
    filterState.selectedBrands.length > 0 ||
    filterState.capacity !== "" ||
    filterState.doubleBac ||
    filterState.fenetre ||
    filterState.app;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Badge résultats */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          {resultCount} Airfryer{resultCount !== 1 ? "s" : ""} trouvé
          {resultCount !== 1 ? "s" : ""}
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

      {/* Recherche */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Recherche</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un modèle..."
            value={filterState.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
            aria-label="Rechercher un modèle"
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["budget", "marque", "capacite", "options"]} className="w-full">
        {/* Budget */}
        <AccordionItem value="budget" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Budget
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-1">
              <Slider
                min={0}
                max={PRICE_MAX}
                step={5}
                value={[filterState.priceMin, filterState.priceMax]}
                onValueChange={handlePriceRange}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">
                {filterState.priceMin}€ – {filterState.priceMax}€
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Marque */}
        <AccordionItem value="marque" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Marque
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2 pt-1 max-h-48 overflow-y-auto">
              {availableBrands.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucune marque</p>
              ) : (
                availableBrands.map((brand) => (
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

        {/* Capacité */}
        <AccordionItem value="capacite" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Capacité
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={filterState.capacity || undefined}
              onValueChange={handleCapacity}
              className="grid gap-2 pt-1"
            >
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <RadioGroupItem value="solo" id="cap-solo" />
                <span>Solo / Couple (&lt; 4 L)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <RadioGroupItem value="family" id="cap-family" />
                <span>Famille (4 L – 7 L)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <RadioGroupItem value="xxl" id="cap-xxl" />
                <span>XXL / Tribu (&gt; 7 L)</span>
              </label>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Options (Features) */}
        <AccordionItem value="options" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Options
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={filterState.doubleBac}
                  onCheckedChange={handleDoubleBac}
                  aria-label="Double bac"
                />
                <span>Double bac</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={filterState.fenetre}
                  onCheckedChange={handleFenetre}
                  aria-label="Fenêtre visible"
                />
                <span>Fenêtre visible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={filterState.app}
                  onCheckedChange={handleApp}
                  aria-label="Application mobile"
                />
                <span>Application mobile</span>
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
