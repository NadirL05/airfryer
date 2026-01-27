-- ============================================
-- MIGRATION: Fast Text Search Function
-- Applied: 2026-01-27
-- Description:
--   Creates a lightweight search function for
--   quick product lookups by name, brand, or type.
-- ============================================

-- Drop existing function if exists (for clean re-run)
DROP FUNCTION IF EXISTS public.search_products(text, int);

-- ============================================
-- FUNCTION: search_products
-- ============================================
CREATE OR REPLACE FUNCTION public.search_products(
  query_text TEXT,
  max_results INT DEFAULT 5
)
RETURNS TABLE (
  id             UUID,
  title          TEXT,
  slug           TEXT,
  main_image_url TEXT,
  price          INT,
  brand_name     TEXT,
  category_slug  TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  search_pattern TEXT;
  v_max_results INT;
BEGIN
  -- Sanitize and prepare search pattern
  search_pattern := '%' || LOWER(TRIM(COALESCE(query_text, ''))) || '%';
  
  -- Limit max results for performance (cap at 20)
  v_max_results := LEAST(GREATEST(COALESCE(max_results, 5), 1), 20);
  
  -- Return empty if query is too short
  IF LENGTH(TRIM(COALESCE(query_text, ''))) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT DISTINCT ON (p.id)
    p.id,
    p.name AS title,
    p.slug,
    p.main_image_url,
    COALESCE(p.min_price, p.max_price, 0) AS price,
    b.name AS brand_name,
    p.type AS category_slug
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  WHERE
    p.is_published = TRUE
    AND (
      -- Search in product name
      LOWER(p.name) LIKE search_pattern
      -- Search in brand name
      OR LOWER(b.name) LIKE search_pattern
      -- Search in product type (category)
      OR LOWER(p.type) LIKE search_pattern
      -- Search in short description
      OR LOWER(COALESCE(p.short_description, '')) LIKE search_pattern
    )
  ORDER BY
    p.id,
    -- Prioritize exact matches in name
    CASE 
      WHEN LOWER(p.name) LIKE search_pattern THEN 0
      WHEN LOWER(b.name) LIKE search_pattern THEN 1
      ELSE 2
    END,
    -- Then by rating
    p.rating_overall DESC NULLS LAST
  LIMIT v_max_results;
END;
$$;

-- ============================================
-- FUNCTION: search_products_ranked (alternative with ranking)
-- Returns results with a relevance score
-- ============================================
CREATE OR REPLACE FUNCTION public.search_products_ranked(
  query_text TEXT,
  max_results INT DEFAULT 10
)
RETURNS TABLE (
  id             UUID,
  title          TEXT,
  slug           TEXT,
  main_image_url TEXT,
  price          INT,
  brand_name     TEXT,
  category_slug  TEXT,
  relevance      INT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  search_pattern TEXT;
  v_max_results INT;
BEGIN
  -- Sanitize and prepare search pattern
  search_pattern := '%' || LOWER(TRIM(COALESCE(query_text, ''))) || '%';
  
  -- Limit max results for performance
  v_max_results := LEAST(GREATEST(COALESCE(max_results, 10), 1), 50);
  
  -- Return empty if query is too short
  IF LENGTH(TRIM(COALESCE(query_text, ''))) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH scored_products AS (
    SELECT
      p.id,
      p.name AS title,
      p.slug,
      p.main_image_url,
      COALESCE(p.min_price, p.max_price, 0) AS price,
      b.name AS brand_name,
      p.type AS category_slug,
      p.rating_overall,
      -- Calculate relevance score
      (
        CASE WHEN LOWER(p.name) LIKE search_pattern THEN 100 ELSE 0 END +
        CASE WHEN LOWER(p.name) = LOWER(TRIM(query_text)) THEN 50 ELSE 0 END +
        CASE WHEN LOWER(b.name) LIKE search_pattern THEN 30 ELSE 0 END +
        CASE WHEN LOWER(p.type) LIKE search_pattern THEN 20 ELSE 0 END +
        CASE WHEN LOWER(COALESCE(p.short_description, '')) LIKE search_pattern THEN 10 ELSE 0 END
      )::INT AS relevance
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE
      p.is_published = TRUE
      AND (
        LOWER(p.name) LIKE search_pattern
        OR LOWER(b.name) LIKE search_pattern
        OR LOWER(p.type) LIKE search_pattern
        OR LOWER(COALESCE(p.short_description, '')) LIKE search_pattern
      )
  )
  SELECT
    sp.id,
    sp.title,
    sp.slug,
    sp.main_image_url,
    sp.price,
    sp.brand_name,
    sp.category_slug,
    sp.relevance
  FROM scored_products sp
  WHERE sp.relevance > 0
  ORDER BY
    sp.relevance DESC,
    sp.rating_overall DESC NULLS LAST,
    sp.title ASC
  LIMIT v_max_results;
END;
$$;

-- ============================================
-- INDEX: Improve search performance
-- ============================================

-- Index for faster ILIKE searches (requires pg_trgm extension)
-- Uncomment if pg_trgm is available:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_brands_name_trgm ON brands USING gin (name gin_trgm_ops);

-- Basic index for type column (if not exists)
CREATE INDEX IF NOT EXISTS idx_products_type_lower ON products (LOWER(type));

-- ============================================
-- GRANT permissions
-- ============================================
GRANT EXECUTE ON FUNCTION public.search_products(TEXT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_products_ranked(TEXT, INT) TO anon, authenticated;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION public.search_products IS 
'Fast text search for products by name, brand, or type.
Parameters:
  - query_text: Search query (minimum 2 characters)
  - max_results: Maximum results to return (default 5, max 20)
Returns: Lightweight product info for search suggestions.';

COMMENT ON FUNCTION public.search_products_ranked IS 
'Text search with relevance ranking for products.
Parameters:
  - query_text: Search query (minimum 2 characters)
  - max_results: Maximum results to return (default 10, max 50)
Returns: Product info with relevance score for better ordering.';
