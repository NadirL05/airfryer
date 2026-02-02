"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Search, Plus, Loader2, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { proxyImageUrl } from "@/lib/utils";
import { useCompareStore } from "@/hooks/use-compare-store";

// ============================================
// Types
// ============================================

interface PickerProduct {
  id: string;
  title: string;
  slug: string;
  main_image_url: string | null;
  price: number;
  brand_name: string | null;
}

// ============================================
// Supabase client
// ============================================

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    new URL(url);
  } catch {
    return null;
  }
  return createClient(url, key);
}

const supabase = typeof window !== "undefined" ? getSupabaseClient() : null;

// ============================================
// Component
// ============================================

interface CompareProductPickerProps {
  /** Produits déjà sélectionnés (IDs) pour masquer/désactiver */
  currentProductIds: string[];
  /** Appelé après ajout réussi (pour rafraîchir la page) */
  onProductAdded?: () => void;
  /** Mode compact pour afficher à côté du comparatif */
  compact?: boolean;
  /** Affichage sidebar (liste verticale sur le côté) */
  sidebar?: boolean;
}

export function CompareProductPicker({
  currentProductIds,
  onProductAdded,
  compact = false,
  sidebar = false,
}: CompareProductPickerProps) {
  const router = useRouter();
  const addProduct = useCompareStore((s) => s.addProduct);
  const products = useCompareStore((s) => s.products);
  const maxItems = useCompareStore((s) => s.maxItems);
  const canAddMore = currentProductIds.length < maxItems;

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<PickerProduct[]>([]);
  const [suggested, setSuggested] = React.useState<PickerProduct[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingSuggested, setLoadingSuggested] = React.useState(true);

  // Charger les produits suggérés au montage
  React.useEffect(() => {
    if (!supabase) {
      setLoadingSuggested(false);
      return;
    }

    const loadSuggested = async () => {
      setLoadingSuggested(true);
      const { data, error } = await supabase
        .from("v_products_with_brand")
        .select("id, name, slug, main_image_url, min_price, max_price, brand_name")
        .eq("is_published", true)
        .order("rating_overall", { ascending: false, nullsFirst: false })
        .limit(12);

      if (!error && data) {
        setSuggested(
          (data as any[]).map((p) => ({
            id: p.id,
            title: p.name,
            slug: p.slug,
            main_image_url: p.main_image_url,
            price: p.min_price ?? p.max_price ?? 0,
            brand_name: p.brand_name,
          }))
        );
      }
      setLoadingSuggested(false);
    };

    loadSuggested();
  }, []);

  // Recherche debounced
  React.useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (!supabase) return;

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const { data, error } = await (supabase as any).rpc("search_products", {
          query_text: query.trim(),
          max_results: 12,
        });

        if (!error && data) {
          setResults(
            (data as any[]).map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              main_image_url: p.main_image_url,
              price: p.price ?? 0,
              brand_name: p.brand_name,
            }))
          );
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleAddProduct = (p: PickerProduct) => {
    const added = addProduct({
      id: p.id,
      slug: p.slug,
      title: p.title,
      image: p.main_image_url,
      price: p.price,
      brand: p.brand_name,
    });

    if (added) {
      const allIds = [...currentProductIds, p.id];
      router.push(`/compare?products=${allIds.join(",")}`);
      onProductAdded?.();
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(price);

  const isInCompare = (id: string) =>
    currentProductIds.includes(id) || products.some((p) => p.id === id);

  const displayList = query.trim().length >= 2 ? results : suggested;
  const showList = loading ? [] : displayList;
  const isEmpty = showList.length === 0 && !loading && !loadingSuggested;

  return (
    <div
      className={
        sidebar
          ? "flex flex-col rounded-lg border bg-card p-4 shadow-sm"
          : compact
            ? "space-y-3"
            : "rounded-xl border bg-muted/30 p-6 sm:p-8"
      }
    >
      <div className={sidebar ? "mb-3" : "mb-4"}>
        <h2 className={sidebar ? "text-base font-semibold tracking-tight" : "text-lg font-semibold tracking-tight sm:text-xl"}>
          {canAddMore
            ? currentProductIds.length === 0
              ? "Produits disponibles"
              : `Produits disponibles (${currentProductIds.length}/${maxItems})`
            : "Comparatif complet"}
        </h2>
        {!sidebar && (
          <p className="mt-1 text-sm text-muted-foreground">
            Recherchez un air fryer ou choisissez parmi les suggestions ci-dessous.
          </p>
        )}
      </div>

      {canAddMore && (
        <div className={`relative ${sidebar ? "mb-3" : "mb-4"}`}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={sidebar ? "Rechercher..." : "Rechercher un produit (nom, marque...)"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Recherche...</span>
        </div>
      )}

      {loadingSuggested && !query && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement des produits...</span>
        </div>
      )}

      {!loading && !loadingSuggested && isEmpty && query.length >= 2 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Aucun résultat pour &quot;{query}&quot;. Essayez un autre terme.
        </p>
      )}

      {!loading && showList.length > 0 && (
        <div
          className={
            sidebar
              ? "flex max-h-[calc(100vh-280px)] flex-col gap-2 overflow-y-auto"
              : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          }
        >
          {showList.map((p) => {
            const inCompare = isInCompare(p.id);
            const disabled = inCompare || !canAddMore;

            return (
              <div
                key={p.id}
                className={
                  sidebar
                    ? "flex items-center gap-2 rounded-lg border bg-background p-2 transition-colors hover:bg-muted/50"
                    : "flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
                }
              >
                <div className={`relative shrink-0 overflow-hidden rounded-md bg-muted ${sidebar ? "h-10 w-10" : "h-14 w-14"}`}>
                  {p.main_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={proxyImageUrl(p.main_image_url, sidebar ? 80 : 112)}
                      alt={p.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className={sidebar ? "h-4 w-4" : "h-6 w-6"} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={sidebar ? "truncate text-xs font-medium" : "truncate text-sm font-medium"}>{p.title}</p>
                  {!sidebar && p.brand_name && (
                    <p className="text-xs text-muted-foreground">{p.brand_name}</p>
                  )}
                  <p className={sidebar ? "text-xs font-semibold text-primary" : "text-xs font-semibold text-primary"}>
                    {formatPrice(p.price)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={inCompare ? "secondary" : "default"}
                  disabled={disabled}
                  onClick={() => handleAddProduct(p)}
                  className={`shrink-0 gap-1 ${sidebar ? "h-8 px-2 text-xs" : ""}`}
                >
                  <Plus className={sidebar ? "h-3 w-3" : "h-4 w-4"} />
                  {inCompare ? "Ajouté" : "Ajouter"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
