"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, ArrowRight, Check, X, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { CompareFloatingBar } from "@/components/compare/compare-floating-bar";
import { CompareProductPicker } from "@/components/compare/compare-product-picker";
import { useCompareProducts } from "@/hooks/use-compare-store";
import { cn, proxyImageUrl } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface ComparedProduct {
  id: string;
  name: string;
  slug: string;
  main_image_url: string | null;
  min_price: number | null;
  max_price: number | null;
  rating_overall: number | null;
  rating_cooking: number | null;
  rating_quality: number | null;
  rating_ease_of_use: number | null;
  rating_value: number | null;
  capacity_liters: number | null;
  wattage: number | null;
  specs: Record<string, any> | null;
  brand_name: string | null;
  affiliate_url?: string | null;
}

type RowKey =
  | "price"
  | "rating_overall"
  | "rating_detail"
  | "capacity"
  | "wattage"
  | "dimensions"
  | "weight"
  | "features_dual_zone"
  | "features_app"
  | "features_dishwasher"
  | "modes";

// ============================================
// Supabase client (client-side)
// ============================================

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

const supabaseClient = typeof window !== "undefined" ? getSupabaseClient() : null;

// ============================================
// Page Component (Client)
// ============================================

export function ComparePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const compareStoreProducts = useCompareProducts();

  const [products, setProducts] = useState<ComparedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract product IDs from URL (?products=id1,id2,id3)
  const idsFromUrl = useMemo(() => {
    const param = searchParams.get("products");
    if (!param) return [];
    return param
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }, [searchParams]);

  // If URL has no products but store does, sync URL from store
  useEffect(() => {
    if (!searchParams || idsFromUrl.length > 0) return;
    if (!compareStoreProducts || compareStoreProducts.length === 0) return;

    const ids = compareStoreProducts.map((p) => p.id).join(",");
    router.replace(`/compare?products=${ids}`);
  }, [compareStoreProducts, idsFromUrl.length, router, searchParams]);

  // Fetch full product data based on IDs
  useEffect(() => {
    if (!supabaseClient) {
      setError(
        "Configuration Supabase manquante. Vérifiez vos variables d'environnement."
      );
      setLoading(false);
      return;
    }

    if (idsFromUrl.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabaseClient
        .from("v_products_with_brand")
        .select(
          `
          id,
          name,
          slug,
          main_image_url,
          min_price,
          max_price,
          rating_overall,
          rating_cooking,
          rating_quality,
          rating_ease_of_use,
          rating_value,
          capacity_liters,
          wattage,
          specs,
          brand_name,
          affiliate_url
        `
        )
        .in("id", idsFromUrl)
        .limit(3);

      if (error) {
        console.error("Error fetching compared products:", error);
        setError("Impossible de charger les produits à comparer.");
        setProducts([]);
      } else {
        setProducts((data || []) as unknown as ComparedProduct[]);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [idsFromUrl]);

  const hasProducts = products.length > 0;

  const goBack = () => {
    router.back();
  };

  // Helper to get comparable values
  const getRowValues = (key: RowKey) => {
    switch (key) {
      case "price":
        return products.map((p) => {
          const price = p.min_price ?? p.max_price ?? null;
          return price !== null
            ? new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
              }).format(price)
            : "—";
        });
      case "rating_overall":
        return products.map((p) =>
          p.rating_overall !== null ? `${p.rating_overall.toFixed(1)}/10` : "—"
        );
      case "rating_detail":
        return products.map((p) => {
          const parts: string[] = [];
          if (p.rating_cooking !== null)
            parts.push(`Cuisson ${p.rating_cooking.toFixed(1)}/10`);
          if (p.rating_quality !== null)
            parts.push(`Qualité ${p.rating_quality.toFixed(1)}/10`);
          if (p.rating_ease_of_use !== null)
            parts.push(`Praticité ${p.rating_ease_of_use.toFixed(1)}/10`);
          if (p.rating_value !== null)
            parts.push(`Rapport Q/P ${p.rating_value.toFixed(1)}/10`);
          return parts.length > 0 ? parts.join(" • ") : "—";
        });
      case "capacity":
        return products.map((p) =>
          p.capacity_liters ? `${p.capacity_liters} L` : "—"
        );
      case "wattage":
        return products.map((p) =>
          p.wattage ? `${p.wattage} W` : "—"
        );
      case "dimensions":
        return products.map((p) => p.specs?.dimensions || "—");
      case "weight":
        return products.map((p) => p.specs?.weight || "—");
      case "features_dual_zone":
        return products.map((p) =>
          p.specs?.has_dual_zone === true || p.specs?.dual_zone === true
            ? "true"
            : "false"
        );
      case "features_app":
        return products.map((p) =>
          p.specs?.has_app === true || p.specs?.app === true
            ? "true"
            : "false"
        );
      case "features_dishwasher":
        return products.map((p) =>
          p.specs?.dishwasher_safe === true ? "true" : "false"
        );
      case "modes":
        return products.map((p) =>
          Array.isArray(p.specs?.modes)
            ? (p.specs!.modes as string[]).join(", ")
            : "—"
        );
      default:
        return products.map(() => "—");
    }
  };

  // Determine which rows have differences
  const rowHasDifferences = (key: RowKey) => {
    const values = getRowValues(key);
    const normalized = values.map((v) => (v ?? "").toString().toLowerCase());
    return new Set(normalized).size > 1;
  };

  const rows: { key: RowKey; label: string }[] = [
    { key: "price", label: "Prix" },
    { key: "rating_overall", label: "Note globale" },
    { key: "rating_detail", label: "Détails des notes" },
    { key: "capacity", label: "Capacité" },
    { key: "wattage", label: "Puissance" },
    { key: "dimensions", label: "Dimensions" },
    { key: "weight", label: "Poids" },
    { key: "features_dual_zone", label: "Double panier / Dual Zone" },
    { key: "features_app", label: "App connectée" },
    { key: "features_dishwasher", label: "Compatible lave-vaisselle" },
    { key: "modes", label: "Modes de cuisson" },
  ];

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Comparatif
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Comparez jusqu&apos;à 3 air fryers en un coup d&apos;œil pour
            trouver celui qui correspond le mieux à vos besoins.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {idsFromUrl.length === 2 && (
            <Button size="sm" className="gap-1.5" asChild>
              <Link href={`/compare/versus?vs=${idsFromUrl.join(",")}`}>
                Vue Duel (Versus)
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux produits</span>
          </Button>
        </div>
      </header>

      {/* Content: main + sidebar produits disponibles */}
      <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-start lg:gap-8">
        {/* Zone principale */}
        <div className="min-w-0 flex-1">
      {/* Loading / Error / Empty States */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Chargement du comparatif...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && !hasProducts && (
        <div className="space-y-6">
          <p className="text-center text-sm text-muted-foreground">
            Ajoutez jusqu&apos;à 3 produits pour les comparer. Utilisez la liste sur le côté.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={goBack} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Retourner à la liste des produits
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && hasProducts && (
        <>
          {/* Section Duel : grille de cartes avec sélection */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">
              Pour un duel côte à côte : sélectionnez 2 produits
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  image_url={p.main_image_url}
                  price={p.min_price ?? p.max_price ?? 0}
                  score={p.rating_overall ?? null}
                  capacity={
                    p.capacity_liters != null
                      ? `${p.capacity_liters} L`
                      : "—"
                  }
                  slug={p.slug}
                  brand_name={p.brand_name}
                  enableSelection
                  affiliate_url={p.affiliate_url ?? null}
                />
              ))}
            </div>
          </section>

          <div className="overflow-x-auto">
          <div
            className={cn(
              "min-w-full",
              "grid gap-4",
              `grid-cols-[minmax(140px,180px)_repeat(${products.length},minmax(220px,1fr))]`
            )}
          >
            {/* Header Row: Images + Titles */}
            <div className="sticky left-0 top-0 z-20 bg-background/95 pb-4 pt-10 text-sm font-semibold text-muted-foreground">
              Produit
            </div>

            {products.map((product) => {
              const price =
                product.min_price ?? product.max_price ?? null;
              const formattedPrice =
                price !== null
                  ? new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      minimumFractionDigits: 0,
                    }).format(price)
                  : null;

              const productUrl = `/product/${product.slug}`;

              return (
                <div
                  key={product.id}
                  className="flex flex-col items-stretch gap-3 border-b pb-4 pt-2"
                >
                  {/* Image + Title */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted sm:h-48">
                      {product.main_image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={proxyImageUrl(product.main_image_url, 400)}
                          alt={product.name}
                          className="absolute inset-0 h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="mb-1 line-clamp-2 text-sm font-semibold">
                        {product.name}
                      </p>
                      {product.brand_name && (
                        <p className="text-xs text-muted-foreground">
                          {product.brand_name}
                        </p>
                      )}
                    </div>
                    {formattedPrice && (
                      <p className="text-sm font-semibold text-primary">
                        {formattedPrice}
                      </p>
                    )}
                    <Button
                      asChild
                      size="sm"
                      className="w-full gap-1.5 text-xs sm:text-sm"
                    >
                      <Link href={productUrl}>
                        <ArrowRight className="h-4 w-4" />
                        Voir le test
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Other Rows */}
            {rows.map((row) => {
              const values = getRowValues(row.key);
              const hasDiff = rowHasDifferences(row.key);

              return (
                <FragmentRow
                  key={row.key}
                  label={row.label}
                  values={values}
                  hasDifferences={hasDiff}
                  type={row.key}
                />
              );
            })}
          </div>
        </div>
        </>
      )}
        </div>

        {/* Sidebar : produits disponibles */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80">
          <CompareProductPicker
            currentProductIds={products.map((p) => p.id)}
            sidebar
          />
        </aside>
      </div>

      <CompareFloatingBar />
    </div>
  );
}

// ============================================
// Row Component
// ============================================

interface FragmentRowProps {
  label: string;
  values: string[];
  hasDifferences: boolean;
  type: RowKey;
}

function FragmentRow({ label, values, hasDifferences, type }: FragmentRowProps) {
  const isFeatureRow =
    type === "features_dual_zone" ||
    type === "features_app" ||
    type === "features_dishwasher";

  return (
    <>
      {/* Label column (sticky) */}
      <div className="sticky left-0 z-10 flex items-center border-r bg-background/95 py-3 pr-3 text-xs font-medium text-muted-foreground sm:text-sm">
        {label}
      </div>

      {/* Product columns */}
      {values.map((value, index) => {
        const isTrue = isFeatureRow && value === "true";
        const isFalse = isFeatureRow && value === "false";

        return (
          <div
            key={index}
            className={cn(
              "flex items-center border-b py-3 px-3 text-xs sm:text-sm",
              hasDifferences && !isFeatureRow && value !== "—"
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {isFeatureRow ? (
              isTrue ? (
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">
                  <Check className="h-3 w-3" />
                  Oui
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  <X className="h-3 w-3" />
                  Non
                </div>
              )
            ) : (
              <span className="break-words">{value}</span>
            )}
          </div>
        );
      })}
    </>
  );
}

