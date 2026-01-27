"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ============================================
// Types
// ============================================

type PriceRange = [number, number];

type FilterValue = string | string[] | null | undefined;

export interface UrlFiltersOptions {
  defaultMinPrice?: number;
  defaultMaxPrice?: number;
  debounceMs?: number;
}

export interface UrlFiltersReturn {
  // State
  priceRange: PriceRange;
  selectedBrands: string[];
  selectedFeatures: string[];
  selectedCapacity: string | null;
  selectedSort: string;

  // Actions
  setPriceRange: (range: PriceRange) => void;
  setFilter: (key: string, value: FilterValue) => void;
  toggleBrand: (slug: string) => void;
  toggleFeature: (key: string) => void;
  setCapacity: (value: string | null) => void;
  setSort: (value: string) => void;
  resetFilters: () => void;

  // Utilities
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

// ============================================
// Helpers
// ============================================

function parseArrayParam(param: string | null): string[] {
  if (!param) return [];
  return param
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Custom debounce hook that returns a debounced version of a callback
 */
function useDebounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// ============================================
// Main Hook
// ============================================

export function useUrlFilters(
  options: UrlFiltersOptions = {}
): UrlFiltersReturn {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const {
    defaultMinPrice = 50,
    defaultMaxPrice = 400,
    debounceMs = 500,
  } = options;

  // -------------------------
  // Parse initial values from URL
  // -------------------------

  const initialMin = Number(searchParams.get("min_price")) || defaultMinPrice;
  const initialMax = Number(searchParams.get("max_price")) || defaultMaxPrice;

  // Local state for price (allows smooth slider movement)
  const [priceRange, setPriceRangeLocal] = useState<PriceRange>([
    initialMin,
    initialMax,
  ]);

  // Derived state from URL (single source of truth for non-debounced filters)
  const selectedBrands = useMemo(
    () => parseArrayParam(searchParams.get("brands")),
    [searchParams]
  );

  const selectedFeatures = useMemo(
    () => parseArrayParam(searchParams.get("features")),
    [searchParams]
  );

  const selectedCapacity = useMemo(
    () => searchParams.get("capacity"),
    [searchParams]
  );

  const selectedSort = useMemo(
    () => searchParams.get("sort") || "score_desc",
    [searchParams]
  );

  // -------------------------
  // URL building utility
  // -------------------------

  const buildUrl = useCallback(
    (updater: (params: URLSearchParams) => void): string => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  // -------------------------
  // Core filter setter
  // -------------------------

  const setFilter = useCallback(
    (key: string, value: FilterValue) => {
      const url = buildUrl((params) => {
        if (Array.isArray(value)) {
          const cleaned = value.map((v) => v.trim()).filter(Boolean);
          if (cleaned.length === 0) {
            params.delete(key);
          } else {
            params.set(key, cleaned.join(","));
          }
        } else if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(url, { scroll: false });
    },
    [buildUrl, router]
  );

  // -------------------------
  // Debounced price sync to URL
  // -------------------------

  const syncPriceToUrl = useCallback(
    (min: number, max: number) => {
      const currentMin = searchParams.get("min_price");
      const currentMax = searchParams.get("max_price");

      // Skip if values haven't changed
      if (currentMin === String(min) && currentMax === String(max)) {
        return;
      }

      const url = buildUrl((params) => {
        // Only set if different from defaults
        if (min !== defaultMinPrice) {
          params.set("min_price", String(min));
        } else {
          params.delete("min_price");
        }

        if (max !== defaultMaxPrice) {
          params.set("max_price", String(max));
        } else {
          params.delete("max_price");
        }
      });

      router.push(url, { scroll: false });
    },
    [buildUrl, router, searchParams, defaultMinPrice, defaultMaxPrice]
  );

  const debouncedSyncPrice = useDebounce(syncPriceToUrl, debounceMs);

  // -------------------------
  // Price range setter (local + debounced URL)
  // -------------------------

  const setPriceRange = useCallback(
    (range: PriceRange) => {
      setPriceRangeLocal(range);
      debouncedSyncPrice(range[0], range[1]);
    },
    [debouncedSyncPrice]
  );

  // Sync local price state when URL changes externally
  useEffect(() => {
    const urlMin = Number(searchParams.get("min_price")) || defaultMinPrice;
    const urlMax = Number(searchParams.get("max_price")) || defaultMaxPrice;

    // Only update if significantly different (prevents loops)
    if (urlMin !== priceRange[0] || urlMax !== priceRange[1]) {
      setPriceRangeLocal([urlMin, urlMax]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, defaultMinPrice, defaultMaxPrice]);

  // -------------------------
  // Toggle helpers
  // -------------------------

  const toggleBrand = useCallback(
    (slug: string) => {
      const set = new Set(selectedBrands);
      if (set.has(slug)) {
        set.delete(slug);
      } else {
        set.add(slug);
      }
      setFilter("brands", Array.from(set));
    },
    [selectedBrands, setFilter]
  );

  const toggleFeature = useCallback(
    (key: string) => {
      const set = new Set(selectedFeatures);
      if (set.has(key)) {
        set.delete(key);
      } else {
        set.add(key);
      }
      setFilter("features", Array.from(set));
    },
    [selectedFeatures, setFilter]
  );

  // -------------------------
  // Capacity setter
  // -------------------------

  const setCapacity = useCallback(
    (value: string | null) => {
      // Toggle behavior: if same value, clear it
      if (value === selectedCapacity) {
        setFilter("capacity", null);
      } else {
        setFilter("capacity", value);
      }
    },
    [selectedCapacity, setFilter]
  );

  // -------------------------
  // Sort setter
  // -------------------------

  const setSort = useCallback(
    (value: string) => {
      // Don't add to URL if it's the default
      if (value === "score_desc") {
        setFilter("sort", null);
      } else {
        setFilter("sort", value);
      }
    },
    [setFilter]
  );

  // -------------------------
  // Reset all filters
  // -------------------------

  const resetFilters = useCallback(() => {
    // Reset local price state
    setPriceRangeLocal([defaultMinPrice, defaultMaxPrice]);

    // Clear all filter params from URL
    router.push(pathname, { scroll: false });
  }, [pathname, router, defaultMinPrice, defaultMaxPrice]);

  // -------------------------
  // Computed values
  // -------------------------

  const hasActiveFilters = useMemo(() => {
    return (
      selectedBrands.length > 0 ||
      selectedFeatures.length > 0 ||
      selectedCapacity !== null ||
      searchParams.has("min_price") ||
      searchParams.has("max_price")
    );
  }, [selectedBrands, selectedFeatures, selectedCapacity, searchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchParams.has("min_price") || searchParams.has("max_price")) count++;
    if (selectedBrands.length > 0) count++;
    if (selectedFeatures.length > 0) count++;
    if (selectedCapacity) count++;
    return count;
  }, [selectedBrands, selectedFeatures, selectedCapacity, searchParams]);

  // -------------------------
  // Return API
  // -------------------------

  return {
    // State
    priceRange,
    selectedBrands,
    selectedFeatures,
    selectedCapacity,
    selectedSort,

    // Actions
    setPriceRange,
    setFilter,
    toggleBrand,
    toggleFeature,
    setCapacity,
    setSort,
    resetFilters,

    // Utilities
    hasActiveFilters,
    activeFilterCount,
  };
}
