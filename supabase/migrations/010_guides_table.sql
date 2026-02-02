-- ============================================
-- MIGRATION: Guides Table
-- Applied: 2026-02-02
-- Description:
--   Table for SEO-optimized guides with featured products
-- ============================================

CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  intro TEXT,
  content_markdown TEXT NOT NULL,
  
  -- Featured Products (array of UUIDs)
  featured_product_ids UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- SEO & Visuals
  main_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_guides_slug ON guides(slug);
CREATE INDEX idx_guides_published ON guides(is_published) WHERE is_published = TRUE;

-- Trigger: auto-update updated_at
CREATE TRIGGER trigger_guides_updated_at
  BEFORE UPDATE ON guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
