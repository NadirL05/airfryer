-- ============================================
-- MIGRATION: Initial Schema for AirFryerDeal.com
-- Applied: 2026-01-26
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: brands
-- ============================================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_brands_slug ON brands(slug);

-- ============================================
-- TABLE: products
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  description TEXT,
  short_description TEXT,
  
  -- Pricing
  min_price INT,
  max_price INT,
  affiliate_url TEXT,
  
  -- Technical Specs
  capacity_liters NUMERIC(4,1),
  wattage INT,
  type TEXT CHECK (type IN ('compact', 'family', 'xxl', 'oven', 'dehydrator')),
  
  -- Features (booleans)
  has_dual_zone BOOLEAN DEFAULT FALSE,
  has_app BOOLEAN DEFAULT FALSE,
  has_rotisserie BOOLEAN DEFAULT FALSE,
  has_grill BOOLEAN DEFAULT FALSE,
  has_dehydrator BOOLEAN DEFAULT FALSE,
  has_keep_warm BOOLEAN DEFAULT FALSE,
  
  -- Ratings (0-10 scale)
  rating_overall NUMERIC(3,1) CHECK (rating_overall >= 0 AND rating_overall <= 10),
  rating_cooking NUMERIC(3,1) CHECK (rating_cooking >= 0 AND rating_cooking <= 10),
  rating_quality NUMERIC(3,1) CHECK (rating_quality >= 0 AND rating_quality <= 10),
  rating_ease_of_use NUMERIC(3,1) CHECK (rating_ease_of_use >= 0 AND rating_ease_of_use <= 10),
  rating_value NUMERIC(3,1) CHECK (rating_value >= 0 AND rating_value <= 10),
  
  -- Images
  main_image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  
  -- SEO & Content
  meta_title TEXT,
  meta_description TEXT,
  pros TEXT[],
  cons TEXT[],
  ideal_for TEXT[],
  
  -- Additional specs as JSONB for flexibility
  specs JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_price ON products(min_price, max_price);
CREATE INDEX idx_products_capacity ON products(capacity_liters);
CREATE INDEX idx_products_rating ON products(rating_overall DESC);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;

-- ============================================
-- TABLE: reviews (user reviews)
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  pros TEXT[],
  cons TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = TRUE;

-- ============================================
-- TABLE: articles (guides & recipes)
-- ============================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('guide', 'recipe', 'comparison', 'news')),
  main_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category);

-- ============================================
-- VIEW: v_products_with_brand
-- Useful for displaying product cards
-- ============================================
CREATE VIEW v_products_with_brand AS
SELECT 
  p.*,
  b.name AS brand_name,
  b.slug AS brand_slug,
  b.logo_url AS brand_logo_url
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.is_published = TRUE;

-- ============================================
-- FUNCTION: filter_products
-- RPC for filtering products by price range, capacity, type, etc.
-- ============================================
CREATE OR REPLACE FUNCTION filter_products(
  p_min_price INT DEFAULT NULL,
  p_max_price INT DEFAULT NULL,
  p_min_capacity NUMERIC DEFAULT NULL,
  p_max_capacity NUMERIC DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_brand_slug TEXT DEFAULT NULL,
  p_has_dual_zone BOOLEAN DEFAULT NULL,
  p_has_app BOOLEAN DEFAULT NULL,
  p_has_rotisserie BOOLEAN DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'rating',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  brand_name TEXT,
  brand_slug TEXT,
  brand_logo_url TEXT,
  min_price INT,
  max_price INT,
  capacity_liters NUMERIC,
  wattage INT,
  type TEXT,
  has_dual_zone BOOLEAN,
  has_app BOOLEAN,
  has_rotisserie BOOLEAN,
  rating_overall NUMERIC,
  main_image_url TEXT,
  short_description TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    b.name AS brand_name,
    b.slug AS brand_slug,
    b.logo_url AS brand_logo_url,
    p.min_price,
    p.max_price,
    p.capacity_liters,
    p.wattage,
    p.type,
    p.has_dual_zone,
    p.has_app,
    p.has_rotisserie,
    p.rating_overall,
    p.main_image_url,
    p.short_description
  FROM products p
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE p.is_published = TRUE
    AND (p_min_price IS NULL OR p.min_price >= p_min_price)
    AND (p_max_price IS NULL OR p.max_price <= p_max_price)
    AND (p_min_capacity IS NULL OR p.capacity_liters >= p_min_capacity)
    AND (p_max_capacity IS NULL OR p.capacity_liters <= p_max_capacity)
    AND (p_type IS NULL OR p.type = p_type)
    AND (p_brand_slug IS NULL OR b.slug = p_brand_slug)
    AND (p_has_dual_zone IS NULL OR p.has_dual_zone = p_has_dual_zone)
    AND (p_has_app IS NULL OR p.has_app = p_has_app)
    AND (p_has_rotisserie IS NULL OR p.has_rotisserie = p_has_rotisserie)
  ORDER BY
    CASE WHEN p_sort_by = 'rating' THEN p.rating_overall END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'price_asc' THEN p.min_price END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'price_desc' THEN p.min_price END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'capacity' THEN p.capacity_liters END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'newest' THEN p.created_at END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================
-- FUNCTION: get_filter_ranges
-- Returns min/max values for filter UI
-- ============================================
CREATE OR REPLACE FUNCTION get_filter_ranges()
RETURNS TABLE (
  min_price INT,
  max_price INT,
  min_capacity NUMERIC,
  max_capacity NUMERIC,
  min_wattage INT,
  max_wattage INT
)
LANGUAGE sql
AS $$
  SELECT 
    MIN(products.min_price)::INT,
    MAX(products.max_price)::INT,
    MIN(products.capacity_liters),
    MAX(products.capacity_liters),
    MIN(products.wattage),
    MAX(products.wattage)
  FROM products
  WHERE is_published = TRUE;
$$;

-- ============================================
-- Trigger: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
