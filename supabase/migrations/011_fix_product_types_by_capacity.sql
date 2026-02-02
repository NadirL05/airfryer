-- ============================================
-- MIGRATION: Fix Product Types Based on Capacity
-- Applied: 2026-02-02
-- Description:
--   Aligne les types de produits avec les plages de capacité définies
--   - compact: < 3L
--   - family: 3-5L
--   - xxl: > 5L
-- ============================================

-- Mise à jour automatique des types basés sur capacity_liters
UPDATE products 
SET type = CASE 
  WHEN capacity_liters < 3 THEN 'compact'
  WHEN capacity_liters >= 3 AND capacity_liters <= 5 THEN 'family'
  WHEN capacity_liters > 5 THEN 'xxl'
  ELSE type
END
WHERE capacity_liters IS NOT NULL;

-- Vérification: Afficher la distribution des types
-- SELECT type, COUNT(*) as count, MIN(capacity_liters) as min_cap, MAX(capacity_liters) as max_cap
-- FROM products WHERE is_published = true GROUP BY type ORDER BY min_cap;
