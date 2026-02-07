"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PARAM_MIN = "min_price";
const PARAM_MAX = "max_price";
const PARAM_BRANDS = "brands";
const PARAM_FEATURES = "features";

export interface UseUrlFiltersOptions {
  defaultMinPrice?: number;
  defaultMaxPrice?: number;
}

export function useUrlFilters(options: UseUrlFiltersOptions = {}) {
  const { defaultMinPrice = 0, defaultMaxPrice = 500 } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const minPrice = useMemo(() => {
    const v = searchParams.get(PARAM_MIN);
    const n = v ? Number(v) : defaultMinPrice;
    return Number.isFinite(n) ? Math.max(0, n) : defaultMinPrice;
  }, [searchParams, defaultMinPrice]);

  const maxPrice = useMemo(() => {
    const v = searchParams.get(PARAM_MAX);
    const n = v ? Number(v) : defaultMaxPrice;
    return Number.isFinite(n) ? Math.min(10000, n) : defaultMaxPrice;
  }, [searchParams, defaultMaxPrice]);

  const priceRange: [number, number] = useMemo(() => [minPrice, maxPrice], [minPrice, maxPrice]);

  const selectedBrands = useMemo(() => {
    const v = searchParams.get(PARAM_BRANDS);
    return v ? v.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
  }, [searchParams]);

  const selectedFeatures = useMemo(() => {
    const v = searchParams.get(PARAM_FEATURES);
    return v ? v.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
  }, [searchParams]);

  const setSearch = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const q = next.toString();
      router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setPriceRange = useCallback(
    (range: [number, number] | number[]) => {
      const [lo, hi] = range;
      setSearch({
        [PARAM_MIN]: lo !== defaultMinPrice ? lo : undefined,
        [PARAM_MAX]: hi !== defaultMaxPrice ? hi : undefined,
      });
    },
    [defaultMinPrice, defaultMaxPrice, setSearch]
  );

  const toggleBrand = useCallback(
    (slug: string) => {
      const next = selectedBrands.includes(slug)
        ? selectedBrands.filter((b) => b !== slug)
        : [...selectedBrands, slug];
      setSearch({ [PARAM_BRANDS]: next.length ? next.join(",") : undefined });
    },
    [selectedBrands, setSearch]
  );

  const toggleFeature = useCallback(
    (value: string) => {
      const next = selectedFeatures.includes(value)
        ? selectedFeatures.filter((f) => f !== value)
        : [...selectedFeatures, value];
      setSearch({ [PARAM_FEATURES]: next.length ? next.join(",") : undefined });
    },
    [selectedFeatures, setSearch]
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters =
    minPrice !== defaultMinPrice ||
    maxPrice !== defaultMaxPrice ||
    selectedBrands.length > 0 ||
    selectedFeatures.length > 0;

  return {
    priceRange,
    setPriceRange,
    selectedBrands,
    toggleBrand,
    selectedFeatures,
    toggleFeature,
    resetFilters,
    hasActiveFilters,
  };
}
