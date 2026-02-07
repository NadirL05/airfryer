import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ComparedProduct {
  id: string;
  name: string;
  main_image_url: string;
  rating_overall: number;
  slug: string;
  min_price: number;
  affiliate_url?: string | null;
  /** Alias pour name (product-card utilise title) */
  title?: string;
  /** Alias pour main_image_url (product-card utilise image) */
  image?: string | null;
  /** Alias pour min_price (product-card utilise price) */
  price?: number;
  brand?: string | null;
}

interface CompareState {
  products: ComparedProduct[];
  maxItems: number;
  selectedIds: string[];
  addProduct: (product: Partial<ComparedProduct> & { id: string }) => boolean;
  removeProduct: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  clear: () => void;
  toggleSelection: (productId: string) => void;
  clearSelection: () => void;
}

const MAX_ITEMS = 3;

function normalizeProduct(
  input: Partial<ComparedProduct> & { id: string }
): ComparedProduct {
  return {
    id: input.id,
    name: input.name ?? input.title ?? "",
    main_image_url: input.main_image_url ?? input.image ?? "",
    rating_overall: input.rating_overall ?? 0,
    slug: input.slug ?? input.id,
    min_price: input.min_price ?? input.price ?? 0,
    affiliate_url: input.affiliate_url ?? null,
    title: input.title,
    image: input.image,
    price: input.price,
    brand: input.brand,
  };
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      products: [],
      maxItems: MAX_ITEMS,
      selectedIds: [],

      addProduct: (product) => {
        const current = get().products;
        if (current.length >= MAX_ITEMS) return false;
        if (current.some((p) => p.id === product.id)) return false;

        const normalized = normalizeProduct(product);
        set({ products: [...current, normalized] });
        return true;
      },

      removeProduct: (id) => {
        set({ products: get().products.filter((p) => p.id !== id) });
      },

      isInCompare: (id) => {
        return get().products.some((p) => p.id === id);
      },

      clearCompare: () => set({ products: [] }),
      clear: () => set({ products: [] }),

      toggleSelection: (id) => {
        const current = get().selectedIds;
        const exists = current.includes(id);
        if (exists) {
          set({ selectedIds: current.filter((x) => x !== id) });
        } else if (current.length < 2) {
          set({ selectedIds: [...current, id] });
        }
      },

      clearSelection: () => set({ selectedIds: [] }),
    }),
    {
      name: "compare-storage",
    }
  )
);

/** Hook retournant la liste des produits du comparateur (alias pratique). */
export function useCompareProducts(): ComparedProduct[] {
  return useCompareStore((s) => s.products);
}
