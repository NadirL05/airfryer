-- Ajouter affiliate_url à la RPC get_filtered_products pour les cartes produit
DROP FUNCTION IF EXISTS public.get_filtered_products(numeric, numeric, uuid[], text[], text[], text, int, int);

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
  affiliate_url     TEXT,
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
      p.id AS prod_id,
      p.name AS prod_name,
      p.slug AS prod_slug,
      p.brand_id AS prod_brand_id,
      b.name AS prod_brand_name,
      b.slug AS prod_brand_slug,
      b.logo_url AS prod_brand_logo_url,
      p.short_description AS prod_short_description,
      p.min_price AS prod_min_price,
      p.max_price AS prod_max_price,
      p.capacity_liters AS prod_capacity_liters,
      p.type AS prod_type,
      p.rating_overall AS prod_rating_overall,
      p.main_image_url AS prod_main_image_url,
      p.affiliate_url AS prod_affiliate_url,
      p.has_dual_zone AS prod_has_dual_zone,
      p.has_app AS prod_has_app,
      p.has_rotisserie AS prod_has_rotisserie,
      p.has_dehydrator AS prod_has_dehydrator,
      p.specs AS prod_specs,
      p.created_at AS prod_created_at
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE
      p.is_published = TRUE
      AND (
        p_min_price IS NULL OR p_min_price = 0
        OR (p.min_price IS NOT NULL AND p.min_price >= p_min_price)
        OR (p.max_price IS NOT NULL AND p.max_price >= p_min_price)
      )
      AND (
        p_max_price IS NULL OR p_max_price >= 10000
        OR (p.min_price IS NOT NULL AND p.min_price <= p_max_price)
        OR (p.max_price IS NOT NULL AND p.max_price <= p_max_price)
      )
      AND (
        p_brand_ids IS NULL
        OR array_length(p_brand_ids, 1) IS NULL
        OR p.brand_id = ANY(p_brand_ids)
      )
      AND (
        p_category_slugs IS NULL
        OR array_length(p_category_slugs, 1) IS NULL
        OR p.type = ANY(p_category_slugs)
      )
      AND (
        p_features IS NULL
        OR array_length(p_features, 1) IS NULL
        OR (
          (NOT 'dual_zone' = ANY(p_features) OR p.has_dual_zone = TRUE)
          AND (NOT 'app' = ANY(p_features) OR p.has_app = TRUE)
          AND (NOT 'rotisserie' = ANY(p_features) OR p.has_rotisserie = TRUE)
          AND (NOT 'dehydrator' = ANY(p_features) OR p.has_dehydrator = TRUE)
        )
      )
  ),
  counted AS (
    SELECT fp.*, COUNT(*) OVER () AS cnt FROM filtered_products fp
  ),
  sorted AS (
    SELECT * FROM counted
    ORDER BY
      CASE WHEN p_sort_by = 'price_asc' THEN prod_min_price END ASC NULLS LAST,
      CASE WHEN p_sort_by = 'price_desc' THEN prod_min_price END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'newest' THEN prod_created_at END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'score_desc' OR p_sort_by IS NULL THEN prod_rating_overall END DESC NULLS LAST,
      prod_name ASC
  )
  SELECT
    s.prod_id, s.prod_name, s.prod_slug, s.prod_brand_id, s.prod_brand_name, s.prod_brand_slug,
    s.prod_brand_logo_url, s.prod_short_description, s.prod_min_price, s.prod_max_price,
    s.prod_capacity_liters, s.prod_type, s.prod_rating_overall, s.prod_main_image_url,
    s.prod_affiliate_url, s.prod_has_dual_zone, s.prod_has_app, s.prod_has_rotisserie,
    s.prod_has_dehydrator, s.prod_specs, s.prod_created_at, s.cnt
  FROM sorted s
  LIMIT v_page_size OFFSET v_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_filtered_products(numeric, numeric, uuid[], text[], text[], text, int, int) TO anon, authenticated;
