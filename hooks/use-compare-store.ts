import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ============================================
// Types
// ============================================

export interface CompareProduct {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  price: number;
  brand: string | null;
}

interface CompareState {
  products: CompareProduct[];
  maxItems: number;
}

interface CompareActions {
  addProduct: (product: CompareProduct) => boolean;
  removeProduct: (id: string) => void;
  clear: () => void;
  isInCompare: (id: string) => boolean;
}

type CompareStore = CompareState & CompareActions;

// ============================================
// Constants
// ============================================

const MAX_COMPARE_ITEMS = 3;
const STORAGE_KEY = "airfryer-compare";

// ============================================
// Store
// ============================================

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      // State
      products: [],
      maxItems: MAX_COMPARE_ITEMS,

      // Actions
      addProduct: (product: CompareProduct): boolean => {
        const { products } = get();

        // Check if already in compare
        if (products.some((p) => p.id === product.id)) {
          return false;
        }

        // Check if max reached
        if (products.length >= MAX_COMPARE_ITEMS) {
          return false;
        }

        // Add product
        set((state) => ({
          products: [...state.products, product],
        }));

        return true;
      },

      removeProduct: (id: string): void => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      clear: (): void => {
        set({ products: [] });
      },

      isInCompare: (id: string): boolean => {
        return get().products.some((p) => p.id === id);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist the products array
      partialize: (state) => ({ products: state.products }),
    }
  )
);

// ============================================
// Selectors (for optimized re-renders)
// ============================================

export const useCompareProducts = () =>
  useCompareStore((state) => state.products);

export const useCompareCount = () =>
  useCompareStore((state) => state.products.length);

export const useIsCompareEmpty = () =>
  useCompareStore((state) => state.products.length === 0);

export const useIsCompareFull = () =>
  useCompareStore((state) => state.products.length >= state.maxItems);

export const useCanAddToCompare = (id: string) =>
  useCompareStore(
    (state) =>
      !state.products.some((p) => p.id === id) &&
      state.products.length < state.maxItems
  );

// ============================================
// Helper hook for toggle functionality
// ============================================

export function useCompareToggle(product: CompareProduct) {
  const isInCompare = useCompareStore((state) =>
    state.products.some((p) => p.id === product.id)
  );
  const isFull = useCompareStore(
    (state) => state.products.length >= state.maxItems
  );
  const addProduct = useCompareStore((state) => state.addProduct);
  const removeProduct = useCompareStore((state) => state.removeProduct);

  const toggle = () => {
    if (isInCompare) {
      removeProduct(product.id);
      return true;
    } else if (!isFull) {
      return addProduct(product);
    }
    return false;
  };

  return {
    isInCompare,
    isFull,
    canAdd: !isInCompare && !isFull,
    toggle,
  };
}
