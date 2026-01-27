-- ============================================
-- MIGRATION: Fix Category Filtering in get_filtered_products
-- Applied: 2026-01-27
-- Description:
--   Fixes the category filtering to properly handle both
--   product.type field and product_categories table
-- ============================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.get_filtered_products(
  numeric, numeric, uuid[], text[], text[], text, int, int
);

-- Recreate function with improved category filtering
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
    SELECT DISTINCT
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
    -- Join with product_categories if table exists and category filter is provided
    LEFT JOIN product_categories pc ON (
      pc.product_id = p.id 
      AND p_category_slugs IS NOT NULL 
      AND array_length(p_category_slugs, 1) > 0
    )
    LEFT JOIN categories c ON (
      c.id = pc.category_id 
      AND c.slug = ANY(p_category_slugs)
    )
    WHERE
      -- Only published products
      p.is_published = TRUE

      -- Price range filter (more flexible)
      AND (
        p_min_price IS NULL 
        OR p_min_price = 0 
        OR (p.min_price IS NOT NULL AND p.min_price >= p_min_price)
        OR (p.max_price IS NOT NULL AND p.max_price >= p_min_price)
      )
      AND (
        p_max_price IS NULL 
        OR p_max_price >= 10000 
        OR (p.min_price IS NOT NULL AND p.min_price <= p_max_price)
        OR (p.max_price IS NOT NULL AND p.max_price <= p_max_price)
      )

      -- Brand filter (by UUID array)
      AND (
        p_brand_ids IS NULL
        OR array_length(p_brand_ids, 1) IS NULL
        OR p.brand_id = ANY(p_brand_ids)
      )

      -- Category filter: Check both product.type AND product_categories
      -- This handles both cases: products with type field and products linked via product_categories
      AND (
        p_category_slugs IS NULL
        OR array_length(p_category_slugs, 1) IS NULL
        OR (
          -- Match by product.type field (compact, family, xxl, oven, dehydrator)
          p.type = ANY(p_category_slugs)
          -- OR match by product_categories table (if exists)
          OR c.slug = ANY(p_category_slugs)
        )
      )

      -- JSONB Features filter
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_filtered_products(
  NUMERIC, NUMERIC, UUID[], TEXT[], TEXT[], TEXT, INT, INT
) TO anon, authenticated;
