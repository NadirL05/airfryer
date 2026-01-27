import { createClient } from "./server";

export async function getFeaturedProducts(limit: number = 4) {
  const supabase = await createClient();

  // Use the view that includes brand information
  const { data, error } = await supabase
    .from("v_products_with_brand")
    .select(
      `
      id,
      name,
      slug,
      main_image_url,
      min_price,
      max_price,
      capacity_liters,
      rating_overall
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }

  return (data || []).map((product) => ({
    id: product.id,
    title: product.name,
    slug: product.slug,
    image_url: product.main_image_url,
    price: product.min_price || product.max_price || 0,
    score: product.rating_overall ? Number(product.rating_overall) : null,
    capacity: product.capacity_liters ? `${product.capacity_liters}L` : "N/A",
    badge_text:
      product.rating_overall && Number(product.rating_overall) > 8.5
        ? "Meilleur choix"
        : undefined,
  }));
}

export async function getBrands(limit: number = 6) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url")
    .limit(limit)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching brands:", error);
    return [];
  }

  return data || [];
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
    // If the table does not exist or category missing, just log and return null
    console.error("Error fetching category by slug:", error);
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
  brand_name: string | null;
  brand_slug: string | null;
  badge_text?: string;
  type: string | null;
  has_dual_zone: boolean;
  has_app: boolean;
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
    console.error("Error calling get_filtered_products RPC:", error);
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

