-- ============================================
-- MIGRATION: Row Level Security (RLS)
-- Lecture publique, écriture réservée au service_role (script de seed)
-- Applied: 2026-01-27
-- ============================================

-- Active la sécurité
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Autorise la lecture pour tout le monde (Public + Anon)
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Articles" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Brands" ON brands FOR SELECT USING (true);

-- Aucune policy INSERT/UPDATE n'est créée pour "anon", donc par défaut, c'est bloqué.
-- Seul le "service_role" (votre script de seed) pourra écrire car il contourne RLS.
