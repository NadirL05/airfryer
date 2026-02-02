import { unstable_cache } from "next/cache";
import { createClient, createClientForCache } from "./server";

const DEFAULT_REVALIDATE = 3600; // 1h

async function getFeaturedProductsUncached(limit: number) {
  try {
    const supabase = createClientForCache();
    const { data, error } = await supabase
      .from("v_products_with_brand")
      .select(
        "id, name, slug, main_image_url, min_price, max_price, capacity_liters, rating_overall"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }

    const placeholderImage =
      "https://m.media-amazon.com/images/I/717ic2tAFEL._AC_SL1500_.jpg";
    return (data || []).map((product) => ({
      id: product.id,
      title: product.name,
      slug: product.slug,
      image_url: product.main_image_url || placeholderImage,
      price: product.min_price || product.max_price || 0,
      score: product.rating_overall ? Number(product.rating_overall) : null,
      capacity: product.capacity_liters ? `${product.capacity_liters}L` : "N/A",
      badge_text:
        product.rating_overall && Number(product.rating_overall) > 8.5
          ? "Meilleur choix"
          : undefined,
    }));
  } catch (error) {
    console.error("Failed to create Supabase client for featured products:", error);
    return [];
  }
}

export async function getFeaturedProducts(limit: number = 4) {
  return unstable_cache(
    () => getFeaturedProductsUncached(limit),
    ["products", "featured", String(limit)],
    { revalidate: DEFAULT_REVALIDATE, tags: ["products"] }
  )();
}

async function getBrandsUncached(limit: number) {
  try {
    const supabase = createClientForCache();
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, slug, logo_url, website_url")
      .limit(limit)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Failed to create Supabase client for brands:", error);
    return [];
  }
}

export async function getBrands(limit: number = 6) {
  return unstable_cache(
    () => getBrandsUncached(limit),
    ["brands", String(limit)],
    { revalidate: DEFAULT_REVALIDATE, tags: ["brands"] }
  )();
}

/** Latest articles (slug, updated_at) for sitemap / listing */
async function getLatestArticlesUncached(limit: number = 50) {
  try {
    const supabase = createClientForCache();
    const { data, error } = await supabase
      .from("articles")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching latest articles:", error);
      return [];
    }
    return (data || []) as { slug: string; updated_at: string | null }[];
  } catch (error) {
    console.error("Failed to fetch latest articles:", error);
    return [];
  }
}

export async function getLatestArticles(limit: number = 50) {
  return unstable_cache(
    () => getLatestArticlesUncached(limit),
    ["articles", "latest", String(limit)],
    { revalidate: DEFAULT_REVALIDATE, tags: ["articles"] }
  )();
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();

  // Query products table with brand join using the view
  // The view already includes all product fields + brand info
  const { data, error } = await supabase
    .from("v_products_with_brand")
    .select("*")
    .eq("slug", slug)
    .single();

  // Handle "not found" error (PGRST116) by returning null
  if (error) {
    if (error.code === "PGRST116" || error.message?.includes("No rows")) {
      return null;
    }
    console.error("Error fetching product by slug:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    // Basic Info
    id: data.id,
    name: data.name,
    slug: data.slug,
    brand_id: data.brand_id,
    brand_name: data.brand_name || null,
    brand_slug: data.brand_slug || null,
    brand_logo_url: data.brand_logo_url || null,
    description: data.description || null,
    short_description: data.short_description || null,

    // Pricing
    min_price: data.min_price,
    max_price: data.max_price,
    affiliate_url: data.affiliate_url || null,

    // Technical Specs
    capacity_liters: data.capacity_liters ? Number(data.capacity_liters) : null,
    wattage: data.wattage,
    type: data.type || null,

    // Features (booleans)
    has_dual_zone: data.has_dual_zone || false,
    has_app: data.has_app || false,
    has_rotisserie: data.has_rotisserie || false,
    has_grill: data.has_grill || false,
    has_dehydrator: data.has_dehydrator || false,
    has_keep_warm: data.has_keep_warm || false,

    // Ratings (0-10 scale, convert from NUMERIC to number)
    rating_overall: data.rating_overall ? Number(data.rating_overall) : null,
    rating_cooking: data.rating_cooking ? Number(data.rating_cooking) : null,
    rating_quality: data.rating_quality ? Number(data.rating_quality) : null,
    rating_ease_of_use: data.rating_ease_of_use
      ? Number(data.rating_ease_of_use)
      : null,
    rating_value: data.rating_value ? Number(data.rating_value) : null,

    // Images
    main_image_url: data.main_image_url || null,
    images: Array.isArray(data.images) ? data.images : [],

    // SEO & Content
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    pros: Array.isArray(data.pros) ? data.pros : [],
    cons: Array.isArray(data.cons) ? data.cons : [],
    ideal_for: Array.isArray(data.ideal_for) ? data.ideal_for : [],

    // Additional specs (JSONB) - can contain any additional data
    specs: data.specs && typeof data.specs === "object" ? data.specs : {},

    // Status
    is_featured: data.is_featured || false,
    is_published: data.is_published !== false, // Default to true

    // Timestamps
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/** Features subset for compare/versus views */
export interface VersusProductFeatures {
  has_dual_zone: boolean;
  has_app: boolean;
  has_rotisserie: boolean;
  has_grill: boolean;
  has_dehydrator: boolean;
  has_keep_warm: boolean;
}

/** Product shape for compare/versus views */
export interface VersusProduct {
  id: string;
  name: string;
  slug: string;
  main_image_url: string | null;
  min_price: number | null;
  max_price: number | null;
  affiliate_url: string | null;
  capacity_liters: number | null;
  wattage: number | null;
  rating_overall: number | null;
  brand_name: string | null;
  features: VersusProductFeatures;
}

/** Fetch up to 2 products by IDs for Versus (duel) – cached by sorted IDs */
async function getProductsByIdsUncached(
  ids: string[]
): Promise<VersusProduct[]> {
  if (ids.length === 0) return [];

  const supabase = createClientForCache();
  const { data, error } = await supabase
    .from("v_products_with_brand")
    .select(
      "id, name, slug, main_image_url, min_price, max_price, affiliate_url, capacity_liters, wattage, rating_overall, brand_name, has_dual_zone, has_app, has_rotisserie, has_grill, has_dehydrator, has_keep_warm"
    )
    .in("id", ids.slice(0, 2))
    .limit(2);

  if (error) {
    console.error("Error fetching products by IDs:", error);
    return [];
  }

  return (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    main_image_url: p.main_image_url ?? null,
    min_price: p.min_price != null ? Number(p.min_price) : null,
    max_price: p.max_price != null ? Number(p.max_price) : null,
    affiliate_url: p.affiliate_url ?? null,
    capacity_liters: p.capacity_liters != null ? Number(p.capacity_liters) : null,
    wattage: p.wattage != null ? Number(p.wattage) : null,
    rating_overall: p.rating_overall != null ? Number(p.rating_overall) : null,
    brand_name: p.brand_name ?? null,
    features: {
      has_dual_zone: Boolean(p.has_dual_zone),
      has_app: Boolean(p.has_app),
      has_rotisserie: Boolean(p.has_rotisserie),
      has_grill: Boolean(p.has_grill),
      has_dehydrator: Boolean(p.has_dehydrator),
      has_keep_warm: Boolean(p.has_keep_warm),
    },
  }));
}

export async function getProductsByIds(
  ids: string[]
): Promise<VersusProduct[]> {
  if (ids.length === 0) return [];
  const keyIds = [...ids.slice(0, 2)].sort();
  const cacheKey = keyIds.join(",");
  return unstable_cache(
    () => getProductsByIdsUncached(ids),
    ["products", "versus", cacheKey],
    { revalidate: DEFAULT_REVALIDATE, tags: ["products", "versus"] }
  )();
}

// ---------------------------
// Category helpers
// ---------------------------

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single();

  if (error) {
    // Table "categories" may not exist; return null and use page fallbacks (no log)
    return null;
  }

  return data;
}

// ---------------------------
// Filtered products (via RPC)
// ---------------------------

export interface ProductFilterOptions {
  minPrice?: number;
  maxPrice?: number;
  brandIds?: string[]; // UUID array
  brands?: string[]; // Brand names (will be converted to IDs)
  categorySlugs?: string[]; // e.g. ["compact", "family", "xxl"]
  capacity?: string[]; // Alias for categorySlugs
  features?: string[]; // e.g. ["dual_zone", "app", "rotisserie"]
  sortBy?: "price_asc" | "price_desc" | "score_desc" | "newest";
  page?: number;
  pageSize?: number;
}

export interface FilteredProductResult {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  price: number;
  score: number | null;
  capacity: string;
  capacity_liters?: number | null;
  brand_name: string | null;
  brand_slug: string | null;
  badge_text?: string;
  type: string | null;
  has_dual_zone: boolean;
  has_app: boolean;
  has_window?: boolean;
}

export interface FilteredProductsResponse {
  products: FilteredProductResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch filtered products using the PostgreSQL RPC function `get_filtered_products`.
 * This provides advanced filtering, sorting, and pagination.
 */
export async function getFilteredProducts(
  categorySlug?: string | null,
  filters: ProductFilterOptions = {}
): Promise<FilteredProductsResponse> {
  const supabase = await createClient();

  const {
    minPrice = 0,
    maxPrice = 10000,
    brandIds,
    brands,
    categorySlugs,
    capacity,
    features,
    sortBy = "score_desc",
    page = 1,
    pageSize = 20,
  } = filters;

  // Convert brand slugs to UUIDs if provided
  let resolvedBrandIds: string[] | null = brandIds || null;

  if (brands && brands.length > 0 && !brandIds) {
    // Brands can be either slugs or names - try both
    const { data: brandData } = await supabase
      .from("brands")
      .select("id, name, slug")
      .or(`slug.in.(${brands.join(",")}),name.in.(${brands.join(",")})`);

    if (brandData && brandData.length > 0) {
      resolvedBrandIds = brandData.map((b) => b.id);
    }
  }

  // Merge categorySlugs and capacity into one array
  const resolvedCategorySlugs = [
    ...(categorySlugs || []),
    ...(capacity || []),
    ...(categorySlug ? [categorySlug] : []),
  ].filter(Boolean);

  // Call the RPC function
  const { data, error } = await supabase.rpc("get_filtered_products", {
    p_min_price: minPrice,
    p_max_price: maxPrice,
    p_brand_ids: resolvedBrandIds,
    p_category_slugs:
      resolvedCategorySlugs.length > 0 ? resolvedCategorySlugs : null,
    p_features: features && features.length > 0 ? features : null,
    p_sort_by: sortBy,
    p_page_number: page,
    p_page_size: pageSize,
  });

  if (error) {
    // RPC may fail if migrations not applied (e.g. get_filtered_products missing); return empty, no log
    return {
      products: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  if (!data || data.length === 0) {
    return {
      products: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  // Extract total_count from first row (window function)
  const totalCount = Number(data[0]?.total_count || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  // Map to frontend-friendly shape
  const products: FilteredProductResult[] = data.map(
    (product: {
      id: string;
      name: string;
      slug: string;
      main_image_url: string | null;
      min_price: number | null;
      max_price: number | null;
      capacity_liters: number | null;
      rating_overall: number | null;
      brand_name: string | null;
      brand_slug: string | null;
      type: string | null;
      has_dual_zone: boolean;
      has_app: boolean;
    }) => ({
      id: product.id,
      title: product.name,
      slug: product.slug,
      image_url: product.main_image_url,
      price: product.min_price || product.max_price || 0,
      score: product.rating_overall ? Number(product.rating_overall) : null,
      capacity: product.capacity_liters
        ? `${product.capacity_liters}L`
        : "N/A",
      capacity_liters: product.capacity_liters != null ? Number(product.capacity_liters) : null,
      brand_name: product.brand_name,
      brand_slug: product.brand_slug,
      type: product.type,
      has_dual_zone: product.has_dual_zone || false,
      has_app: product.has_app || false,
      badge_text:
        product.rating_overall && Number(product.rating_overall) > 8.5
          ? "Meilleur choix"
          : undefined,
    })
  );

  return {
    products,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Simple wrapper that returns just the products array (for backward compatibility)
 */
export async function getFilteredProductsSimple(
  categorySlug?: string | null,
  filters: ProductFilterOptions = {}
): Promise<FilteredProductResult[]> {
  const result = await getFilteredProducts(categorySlug, filters);
  return result.products;
}

// ---------------------------
// Quiz Wizard – products with capacity, price, features
// ---------------------------

export interface QuizProduct {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  price: number;
  capacityLiters: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  type: string | null;
  has_dual_zone: boolean;
  has_app: boolean;
  has_window?: boolean;
  score: number | null;
}

// ---------------------------
// Guides – fetch guide by slug + featured products
// ---------------------------

export interface GuideData {
  id: string;
  title: string;
  slug: string;
  intro: string | null;
  content_markdown: string;
  featured_product_ids: string[];
  main_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuideWithProducts {
  guide: GuideData;
  products: FilteredProductResult[];
}

/**
 * Fetch guide by slug + associated featured products.
 */
export async function getGuideBySlug(slug: string): Promise<GuideWithProducts | null> {
  const supabase = await createClient();

  // Fetch guide
  const { data: guideData, error: guideError } = await supabase
    .from("guides")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (guideError || !guideData) {
    return null;
  }

  const guide = guideData as unknown as GuideData;

  // Fetch featured products if any
  let products: FilteredProductResult[] = [];
  if (guide.featured_product_ids && guide.featured_product_ids.length > 0) {
    const { data: productsData, error: productsError } = await supabase
      .from("v_products_with_brand")
      .select(
        "id, name, slug, main_image_url, min_price, max_price, capacity_liters, rating_overall, brand_name, brand_slug, type, has_dual_zone, has_app"
      )
      .in("id", guide.featured_product_ids);

    if (!productsError && productsData) {
      products = productsData.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        title: p.name as string,
        slug: p.slug as string,
        image_url: (p.main_image_url as string) || null,
        price: (p.min_price as number) || (p.max_price as number) || 0,
        score: p.rating_overall != null ? Number(p.rating_overall) : null,
        capacity: p.capacity_liters ? `${p.capacity_liters}L` : "N/A",
        capacity_liters: p.capacity_liters != null ? Number(p.capacity_liters) : null,
        brand_name: (p.brand_name as string) || null,
        brand_slug: (p.brand_slug as string) || null,
        type: (p.type as string) || null,
        has_dual_zone: Boolean(p.has_dual_zone),
        has_app: Boolean(p.has_app),
        badge_text:
          p.rating_overall && Number(p.rating_overall) > 8.5
            ? "Meilleur choix"
            : undefined,
      }));
    }
  }

  return { guide, products };
}

/**
 * Fetch all published products with fields needed for the quiz wizard.
 */
export async function getProductsForQuiz(): Promise<QuizProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_products_with_brand")
    .select(
      "id, name, slug, main_image_url, min_price, max_price, capacity_liters, type, has_dual_zone, has_app, rating_overall, specs"
    )
    .eq("is_published", true)
    .order("rating_overall", { ascending: false });

  if (error) {
    console.error("Error fetching products for quiz:", error);
    return [];
  }

  const placeholderImage =
    "https://images.unsplash.com/photo-1585307518179-e6c30c1f0dcc?auto=format&fit=crop&q=80&w=400";
  return (data || []).map((p: Record<string, unknown>) => {
    const minPrice = p.min_price != null ? Number(p.min_price) : null;
    const maxPrice = p.max_price != null ? Number(p.max_price) : null;
    const price = minPrice ?? maxPrice ?? 0;
    const specs = (p.specs as Record<string, unknown>) ?? {};
    return {
      id: p.id as string,
      title: p.name as string,
      slug: p.slug as string,
      image_url: (p.main_image_url as string) || placeholderImage,
      price,
      capacityLiters:
        p.capacity_liters != null ? Number(p.capacity_liters) : null,
      minPrice,
      maxPrice,
      type: (p.type as string) ?? null,
      has_dual_zone: Boolean(p.has_dual_zone),
      has_app: Boolean(p.has_app),
      has_window: Boolean(specs.has_window),
      score:
        p.rating_overall != null ? Number(p.rating_overall) : null,
    };
  });
}

