-- ============================================
-- MIGRATION: Advanced Product Filtering Function
-- Applied: 2026-01-27
-- Description:
--   Creates a robust PostgreSQL function for dynamic
--   product filtering with pagination, sorting, and
--   JSONB feature matching.
-- ============================================

-- Drop existing function if exists (for clean re-run)
DROP FUNCTION IF EXISTS public.get_filtered_products(
  numeric, numeric, uuid[], text[], text[], text, int, int
);

-- ============================================
-- FUNCTION: get_filtered_products
-- ============================================
CREATE OR REPLACE FUNCTION public.get_filtered_products(
  p_min_price       NUMERIC DEFAULT 0,
  p_max_price       NUMERIC DEFAULT 10000,
  p_brand_ids       UUID[] DEFAULT NULL,
  p_category_slugs  TEXT[] DEFAULT NULL,
  p_features        TEXT[] DEFAULT NULL,
  p_sort_by         TEXT DEFAULT 'score_desc',
  p_page_number     INT DEFAULT 1,
  p_page_size       INT DEFAULT 20
)
RETURNS TABLE (
  id                UUID,
  name              TEXT,
  slug              TEXT,
  brand_id          UUID,
  brand_name        TEXT,
  brand_slug        TEXT,
  brand_logo_url    TEXT,
  short_description TEXT,
  min_price         INT,
  max_price         INT,
  capacity_liters   NUMERIC,
  type              TEXT,
  rating_overall    NUMERIC,
  main_image_url    TEXT,
  has_dual_zone     BOOLEAN,
  has_app           BOOLEAN,
  has_rotisserie    BOOLEAN,
  has_dehydrator    BOOLEAN,
  specs             JSONB,
  created_at        TIMESTAMPTZ,
  total_count       BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_page_number INT := GREATEST(COALESCE(p_page_number, 1), 1);
  v_page_size   INT := LEAST(GREATEST(COALESCE(p_page_size, 20), 1), 100);
  v_offset      INT := (v_page_number - 1) * v_page_size;
BEGIN
  RETURN QUERY
  WITH filtered_products AS (
    SELECT
      p.id,
      p.name,
      p.slug,
      p.brand_id,
      b.name              AS brand_name,
      b.slug              AS brand_slug,
      b.logo_url          AS brand_logo_url,
      p.short_description,
      p.min_price,
      p.max_price,
      p.capacity_liters,
      p.type,
      p.rating_overall,
      p.main_image_url,
      p.has_dual_zone,
      p.has_app,
      p.has_rotisserie,
      p.has_dehydrator,
      p.specs,
      p.created_at
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE
      -- Only published products
      p.is_published = TRUE

      -- Price range filter
      AND (p_min_price IS NULL OR p_min_price = 0 OR p.min_price >= p_min_price)
      AND (p_max_price IS NULL OR p_max_price = 10000 OR p.max_price <= p_max_price)

      -- Brand filter (by UUID array)
      AND (
        p_brand_ids IS NULL
        OR array_length(p_brand_ids, 1) IS NULL
        OR p.brand_id = ANY(p_brand_ids)
      )

      -- Category filter (by slug array via product_categories join)
      -- Note: If product_categories table doesn't exist, this will be ignored
      AND (
        p_category_slugs IS NULL
        OR array_length(p_category_slugs, 1) IS NULL
        OR p.type = ANY(p_category_slugs)
      )

      -- JSONB Features filter
      -- Check boolean columns first, then fallback to specs JSONB
      AND (
        p_features IS NULL
        OR array_length(p_features, 1) IS NULL
        OR (
          -- Check each feature: either via boolean column or JSONB specs
          (NOT 'dual_zone' = ANY(p_features) OR p.has_dual_zone = TRUE)
          AND (NOT 'app' = ANY(p_features) OR p.has_app = TRUE)
          AND (NOT 'rotisserie' = ANY(p_features) OR p.has_rotisserie = TRUE)
          AND (NOT 'dehydrator' = ANY(p_features) OR p.has_dehydrator = TRUE)
          AND (NOT 'grill' = ANY(p_features) OR p.has_grill = TRUE)
          AND (NOT 'keep_warm' = ANY(p_features) OR p.has_keep_warm = TRUE)
          -- For any other features, check the specs JSONB
          AND (
            NOT EXISTS (
              SELECT 1 FROM unnest(p_features) AS f
              WHERE f NOT IN ('dual_zone', 'app', 'rotisserie', 'dehydrator', 'grill', 'keep_warm')
            )
            OR (
              SELECT bool_and(
                COALESCE((p.specs->>f)::boolean, FALSE) = TRUE
                OR COALESCE(p.specs->>'has_' || f, 'false') = 'true'
              )
              FROM unnest(p_features) AS f
              WHERE f NOT IN ('dual_zone', 'app', 'rotisserie', 'dehydrator', 'grill', 'keep_warm')
            )
          )
        )
      )
  ),
  counted AS (
    SELECT
      fp.*,
      COUNT(*) OVER () AS total_count
    FROM filtered_products fp
  ),
  sorted AS (
    SELECT *
    FROM counted
    ORDER BY
      CASE WHEN p_sort_by = 'price_asc' THEN min_price END ASC NULLS LAST,
      CASE WHEN p_sort_by = 'price_desc' THEN min_price END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'newest' THEN created_at END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'score_desc' OR p_sort_by IS NULL THEN rating_overall END DESC NULLS LAST,
      -- Secondary sort by name for consistency
      name ASC
  )
  SELECT
    s.id,
    s.name,
    s.slug,
    s.brand_id,
    s.brand_name,
    s.brand_slug,
    s.brand_logo_url,
    s.short_description,
    s.min_price,
    s.max_price,
    s.capacity_liters,
    s.type,
    s.rating_overall,
    s.main_image_url,
    s.has_dual_zone,
    s.has_app,
    s.has_rotisserie,
    s.has_dehydrator,
    s.specs,
    s.created_at,
    s.total_count
  FROM sorted s
  LIMIT v_page_size
  OFFSET v_offset;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_filtered_products(
  NUMERIC, NUMERIC, UUID[], TEXT[], TEXT[], TEXT, INT, INT
) TO anon, authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.get_filtered_products IS 
'Advanced product filtering with pagination.
Parameters:
  - p_min_price: Minimum price filter (default 0)
  - p_max_price: Maximum price filter (default 10000)
  - p_brand_ids: Array of brand UUIDs to filter by
  - p_category_slugs: Array of category/type slugs (compact, family, xxl, etc.)
  - p_features: Array of feature keys (dual_zone, app, rotisserie, dehydrator, etc.)
  - p_sort_by: Sort order (price_asc, price_desc, score_desc, newest)
  - p_page_number: Page number for pagination (1-indexed)
  - p_page_size: Number of items per page (max 100)
Returns: Product rows with brand info and total_count for pagination.';
