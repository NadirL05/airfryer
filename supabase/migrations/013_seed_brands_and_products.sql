-- ============================================
-- SEED: Marques + Produits (upsert)
-- Compatible schéma products (specs, prix INT, rating 0-10)
-- ============================================

-- 1. Sécuriser les marques
INSERT INTO brands (name, slug) VALUES
  ('Moulinex', 'moulinex'),
  ('Ninja', 'ninja'),
  ('Cecotec', 'cecotec'),
  ('Cosori', 'cosori'),
  ('Russell Hobbs', 'russell-hobbs'),
  ('Philips', 'philips'),
  ('Générique', 'generique')
ON CONFLICT (name) DO NOTHING;

-- 2. Insertion / Mise à jour massive des produits
-- (prix en INT euros, rating sur 10, specs en JSONB)
INSERT INTO products (
  name, slug, brand_id, capacity_liters, wattage, type, min_price, max_price,
  rating_overall, short_description, affiliate_url, main_image_url, specs, is_published
) VALUES
  -- 1. Moulinex Vision
  (
    'Moulinex Friteuse sans huile + Gril Vision (4.6L)',
    'moulinex-easy-fry-grill-vision-ez506820',
    (SELECT id FROM brands WHERE name = 'Moulinex' LIMIT 1),
    4.6, 1550, 'compact', 75, 75, 9.0,
    'Friteuse sans huile 2-en-1 (air fryer + gril) avec fenêtre transparente amovible. Technologie Extra Crisp -99% matière grasse.',
    'https://www.amazon.fr/s?k=Moulinex+EZ506820',
    'https://m.media-amazon.com/images/I/717ic2tAFEL._AC_SL1500_.jpg',
    '{"has_window": true, "has_grill": true, "programs": 8}'::jsonb,
    true
  ),
  -- 2. Moulinex Essential
  (
    'Moulinex Easy Fry Essential Inox (8.3L)',
    'moulinex-easy-fry-essential-inox-8-3l',
    (SELECT id FROM brands WHERE name = 'Moulinex' LIMIT 1),
    8.3, 1700, 'xxl', 100, 100, 8.8,
    'Grande capacité 8.3L pour 8 personnes. Design Inox, synchronisation cuisson et compatible App Moulinex.',
    'https://www.amazon.fr/s?k=Moulinex+Easy+Fry+Essential+8.3L',
    'https://m.media-amazon.com/images/I/71YbD%2BG2ZJL._AC_SL1500_.jpg',
    '{"has_app": true, "programs": 7, "capacity_type": "XXL"}'::jsonb,
    true
  ),
  -- 3. Moulinex Terracotta
  (
    'Moulinex Easy Fry POP Terracotta (5L)',
    'moulinex-easy-fry-pop-terracotta-5l',
    (SELECT id FROM brands WHERE name = 'Moulinex' LIMIT 1),
    5.0, 1500, 'family', 60, 60, 8.6,
    'Design unique couleur Terracotta. Format 5L pour 6 personnes. Économe en énergie et écran tactile.',
    'https://www.amazon.fr/s?k=Moulinex+Easy+Fry+POP+Terracotta',
    'https://m.media-amazon.com/images/I/71vwJqkXDCL._AC_SL1500_.jpg',
    '{"color": "Terracotta", "programs": 10, "is_compact": true}'::jsonb,
    true
  ),
  -- 4. Ninja FlexDrawer
  (
    'Ninja FlexDrawer 6.6L (AF550EU)',
    'ninja-flexdrawer-air-fryer-6-6l',
    (SELECT id FROM brands WHERE name = 'Ninja' LIMIT 1),
    6.6, 2400, 'family', 120, 120, 9.6,
    'Système FlexDrawer : transformez deux zones en une seule méga zone. 6-en-1 : frire, rôtir, déshydrater...',
    'https://www.amazon.fr/s?k=Ninja+FlexDrawer+AF550EU',
    'https://m.media-amazon.com/images/I/61L5KoNgECL._AC_SX679_.jpg',
    '{"has_flex_zone": true, "has_dual_zone": true, "programs": 6}'::jsonb,
    true
  ),
  -- 5. Cecotec 5500
  (
    'Cecotec Cecofry Fantastik 5500 (5.5L)',
    'cecotec-cecofry-fantastik-5500',
    (SELECT id FROM brands WHERE name = 'Cecotec' LIMIT 1),
    5.5, 1500, 'family', 42, 42, 8.4,
    'Rapport qualité-prix excellent. 5.5L avec technologie PerfectCook et 9 modes. Protection surchauffe.',
    'https://www.amazon.fr/s?k=Cecotec+Cecofry+Fantastik+5500',
    'https://m.media-amazon.com/images/I/61Kt5kQxfqL._AC_SL1500_.jpg',
    '{"programs": 9, "technology": "PerfectCook"}'::jsonb,
    true
  ),
  -- 6. Moulinex Mega
  (
    'Moulinex Easy Fry Mega (7.5L)',
    'moulinex-easy-fry-mega-7-5l',
    (SELECT id FROM brands WHERE name = 'Moulinex' LIMIT 1),
    7.5, 1700, 'xxl', 80, 80, 9.0,
    'Format compact mais capacité géante de 7.5L (8 personnes). Design noir élégant et cuisson rapide.',
    'https://www.amazon.fr/s?k=Moulinex+Easy+Fry+Mega',
    'https://m.media-amazon.com/images/I/71KvbqYLBRL._AC_SL1500_.jpg',
    '{"capacity_type": "Mega", "programs": 8}'::jsonb,
    true
  ),
  -- 7. Ninja Vertical
  (
    'NINJA Double Stack XL Verticale (9.5L)',
    'ninja-double-stack-xl-air-fryer',
    (SELECT id FROM brands WHERE name = 'Ninja' LIMIT 1),
    9.5, 2470, 'xxl', 190, 190, 9.8,
    'Innovation : Gain de place 30% grâce au design vertical. 2 compartiments, 4 niveaux de cuisson, idéal familles.',
    'https://www.amazon.fr/s?k=NINJA+Double+Stack+XL',
    'https://m.media-amazon.com/images/I/81SJYt48OtL._AC_SL1500_.jpg',
    '{"is_vertical": true, "has_dual_zone": true, "is_space_saving": true}'::jsonb,
    true
  ),
  -- 8. Cosori TwinFry
  (
    'COSORI Air Fryer 10L TwinFry',
    'cosori-air-fryer-10l-twinfry',
    (SELECT id FROM brands WHERE name = 'Cosori' LIMIT 1),
    10.0, 2000, 'xxl', 200, 200, 9.4,
    'Monstre de 10L avec séparateur amovible (Double Zone). Double résistance et App VeSync avec recettes.',
    'https://www.amazon.fr/s?k=COSORI+TwinFry+10L',
    'https://m.media-amazon.com/images/I/71Q7hXp3k8L._AC_SL1500_.jpg',
    '{"has_flex_zone": true, "capacity_type": "XXXL", "has_app": true}'::jsonb,
    true
  ),
  -- 9. Russell Hobbs
  (
    'Russell Hobbs Air Fryer Rapid Air (4.3L)',
    'russell-hobbs-air-fryer-rapid-air-4-3l',
    (SELECT id FROM brands WHERE name = 'Russell Hobbs' LIMIT 1),
    4.3, 1350, 'compact', 55, 55, 8.2,
    'Ultra compact et silencieux. Idéal pour petites cuisines. Fonctions Gril et Rôtissage incluses.',
    'https://www.amazon.fr/s?k=Russell+Hobbs+27610-56',
    'https://m.media-amazon.com/images/I/71xdqCh-tIL._AC_SL1500_.jpg',
    '{"is_compact": true, "is_quiet": true}'::jsonb,
    true
  ),
  -- 10. Générique 10L
  (
    'Air Fryer Générique Double Bac (10L)',
    'friteuse-sans-huile-10l-2-tiroir',
    (SELECT id FROM brands WHERE name = 'Générique' LIMIT 1),
    10.0, 2400, 'xxl', 76, 76, 8.0,
    'Alternative économique 10L : 2 compartiments indépendants, fenêtres de cuisson et écran tactile.',
    'https://www.amazon.fr/s?k=Air+Fryer+10L+Double+Tiroir',
    'https://m.media-amazon.com/images/I/71fSEy%2BdPoL._AC_SL1500_.jpg',
    '{"has_window": true, "has_dual_zone": true}'::jsonb,
    true
  ),
  -- 11. Moulinex Dual Flex
  (
    'Moulinex Easy Fry Dual Flex (9L)',
    'moulinex-easy-fry-dual-flex-9l',
    (SELECT id FROM brands WHERE name = 'Moulinex' LIMIT 1),
    9.0, 1800, 'xxl', 130, 130, 9.2,
    'Grand tiroir 9L divisible en deux zones avec séparateur. Idéal pour cuisiner plat et accompagnement.',
    'https://www.amazon.fr/s?k=Moulinex+EZ9228F0',
    'https://m.media-amazon.com/images/I/71Pb0kYKRqL._AC_SL1500_.jpg',
    '{"has_flex_zone": true, "has_dual_zone": true, "programs": 7}'::jsonb,
    true
  ),
  -- 12. Philips 2000 4.2L
  (
    'Philips Airfryer Série 2000 Compact (4.2L)',
    'philips-airfryer-serie-2000-4-2l',
    (SELECT id FROM brands WHERE name = 'Philips' LIMIT 1),
    4.2, 1500, 'compact', 84, 84, 8.8,
    'Technologie RapidAir brevetée. 13 modes de cuisson et design compact. Le savoir-faire Philips.',
    'https://www.amazon.fr/s?k=Philips+NA229',
    'https://m.media-amazon.com/images/I/61YHx8DKNQL._AC_SL1500_.jpg',
    '{"programs": 13, "technology": "RapidAir", "is_compact": true}'::jsonb,
    true
  ),
  -- 13. Philips 3000 Dual
  (
    'Philips Airfryer Série 3000 Double Panier (9L)',
    'philips-airfryer-serie-3000-double-panier-9l',
    (SELECT id FROM brands WHERE name = 'Philips' LIMIT 1),
    9.0, 2750, 'xxl', 129, 129, 9.4,
    'Double panier indépendant (9L total) avec fonction Smart Sync. Compatible App HomeID.',
    'https://www.amazon.fr/s?k=Philips+NA350',
    'https://m.media-amazon.com/images/I/71hnp0LZMCL._AC_SL1500_.jpg',
    '{"has_dual_zone": true, "has_app": true, "technology": "RapidAir"}'::jsonb,
    true
  ),
  -- 14. Ninja 3.8L
  (
    'NINJA Air Fryer 3.8L (AF100EU)',
    'ninja-air-fryer-3-8l-4-en-1',
    (SELECT id FROM brands WHERE name = 'Ninja' LIMIT 1),
    3.8, 1550, 'compact', 60, 60, 9.0,
    'Le classique 4-en-1 : Frire, Rôtir, Déshydrater, Réchauffer. Panier céramique antiadhésif.',
    'https://www.amazon.fr/s?k=NINJA+AF100EU',
    'https://m.media-amazon.com/images/I/718NLTlCvLL._AC_UL320_.jpg',
    '{"programs": 4, "is_compact": true}'::jsonb,
    true
  ),
  -- 15. Philips 2000 Fenêtre
  (
    'Philips Airfryer Série 2000 avec Fenêtre (6.2L)',
    'philips-serie-2000-na230-6-2l',
    (SELECT id FROM brands WHERE name = 'Philips' LIMIT 1),
    6.2, 1700, 'family', 70, 70, 9.2,
    'Grande capacité 6.2L avec fenêtre de cuisson. Technologie RapidAir et écran tactile moderne.',
    'https://www.amazon.fr/s?k=Philips+NA230',
    'https://m.media-amazon.com/images/I/71vYlFd6hcL._AC_SL1500_.jpg',
    '{"has_window": true, "programs": 13, "technology": "RapidAir"}'::jsonb,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  brand_id = EXCLUDED.brand_id,
  capacity_liters = EXCLUDED.capacity_liters,
  wattage = EXCLUDED.wattage,
  type = EXCLUDED.type,
  min_price = EXCLUDED.min_price,
  max_price = EXCLUDED.max_price,
  rating_overall = EXCLUDED.rating_overall,
  short_description = EXCLUDED.short_description,
  affiliate_url = EXCLUDED.affiliate_url,
  main_image_url = EXCLUDED.main_image_url,
  specs = EXCLUDED.specs,
  updated_at = NOW();
