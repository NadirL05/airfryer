-- ============================================
-- SEED: Brands data for AirFryerDeal.com
-- Applied: 2026-01-26
-- ============================================

INSERT INTO brands (name, slug, logo_url, description, website_url) VALUES
  (
    'Ninja',
    'ninja',
    '/images/brands/ninja-logo.png',
    'Ninja est une marque américaine réputée pour ses air fryers innovants, notamment la gamme Foodi avec technologie dual zone.',
    'https://www.ninjakitchen.com'
  ),
  (
    'Philips',
    'philips',
    '/images/brands/philips-logo.png',
    'Philips, pionnier de l''air fryer, propose des modèles premium avec la technologie brevetée Rapid Air pour une cuisson parfaite.',
    'https://www.philips.fr'
  ),
  (
    'Cosori',
    'cosori',
    '/images/brands/cosori-logo.png',
    'Cosori offre un excellent rapport qualité-prix avec des air fryers connectés et un design moderne à prix accessible.',
    'https://www.cosori.com'
  ),
  (
    'Tefal',
    'tefal',
    '/images/brands/tefal-logo.png',
    'Tefal, marque française du groupe SEB, propose la gamme ActiFry avec pale rotative brevetée pour une cuisson homogène.',
    'https://www.tefal.fr'
  ),
  (
    'Moulinex',
    'moulinex',
    '/images/brands/moulinex-logo.png',
    'Moulinex, icône française de l''électroménager, propose des air fryers Easy Fry accessibles et performants.',
    'https://www.moulinex.fr'
  ),
  (
    'Xiaomi',
    'xiaomi',
    '/images/brands/xiaomi-logo.png',
    'Xiaomi propose des air fryers connectés avec l''application Mi Home, alliant technologie et prix compétitif.',
    'https://www.mi.com'
  )
ON CONFLICT (slug) DO NOTHING;
