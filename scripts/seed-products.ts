import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes.');
  console.error('Assurez-vous d\'avoir NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Types alignés sur la table products (pas de table categories)
type ProductSeed = {
  slug: string;
  name: string;
  brand_slug: string;
  min_price: number;
  max_price?: number;
  capacity_liters: number;
  wattage: number;
  type: 'compact' | 'family' | 'xxl' | 'oven' | 'dehydrator';
  has_dual_zone: boolean;
  has_app: boolean;
  has_rotisserie?: boolean;
  has_grill?: boolean;
  short_description: string;
  main_image_url: string;
  ideal_for: string[];
  specs: Record<string, unknown>;
  rating_overall: number;
  rating_cooking?: number;
  rating_quality?: number;
  rating_ease_of_use?: number;
  rating_value?: number;
};

async function seed() {
  console.log('🌱 Démarrage du Seed...');

  // 1. MARQUES
  const brands = [
    { name: 'Philips', slug: 'philips', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Philips_Logo.svg/2560px-Philips_Logo.svg.png' },
    { name: 'Cosori', slug: 'cosori', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Cosori_logo.png/640px-Cosori_logo.png' },
    { name: 'Ninja', slug: 'ninja', logo_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9rI2dSzqHXc2BKcBuPpI_nbSHVKLrBNGJug&s' },
    { name: 'Moulinex', slug: 'moulinex', logo_url: 'https://www.leairfryer.fr/wp-content/uploads/2024/12/Moulinex-logo.png' },
    { name: 'Cecotec', slug: 'cecotec', logo_url: null },
    { name: 'Russell Hobbs', slug: 'russell-hobbs', logo_url: null },
    { name: 'Autres', slug: 'autres', logo_url: null },
  ];

  console.log('... Insertion des marques');
  const { data: insertedBrands, error: brandError } = await supabase
    .from('brands')
    .upsert(brands, { onConflict: 'slug' })
    .select();

  if (brandError) throw brandError;
  const brandMap = new Map(insertedBrands!.map((b: { slug: string; id: string }) => [b.slug, b.id]));

  // 2. PRODUITS (colonnes = table products, pas de table categories)
  const products: ProductSeed[] = [
    {
      slug: 'philips-dual-basket-3000',
      name: 'Philips Airfryer Dual Basket Série 3000',
      brand_slug: 'philips',
      min_price: 180,
      max_price: 230,
      capacity_liters: 9.0,
      wattage: 2750,
      type: 'family',
      has_dual_zone: true,
      has_app: true,
      has_rotisserie: false,
      has_grill: true,
      short_description: "Le premier Airfryer Philips à deux tiroirs asymétriques (6L + 3L). Idéal pour cuire un poulet entier d'un côté et des légumes.",
      main_image_url: 'https://images.philips.com/is/image/PhilipsConsumer/NA352_00-IMS-fr_FR?wid=800&hei=800',
      ideal_for: ['Familles (4-6 pers)', 'Repas Complets', 'Flexibilité'],
      specs: { has_dual_zone: true, has_app: true, modes: ['Airfry', 'Bake', 'Grill'], dishwasher_safe: true },
      rating_overall: 8.8,
      rating_cooking: 9,
      rating_quality: 8.5,
      rating_ease_of_use: 8.5,
      rating_value: 9,
    },
    {
      slug: 'cosori-turbo-tower-pro',
      name: 'Cosori Turbo Tower Pro Smart 10.8L',
      brand_slug: 'cosori',
      min_price: 200,
      max_price: 250,
      capacity_liters: 10.8,
      wattage: 2400,
      type: 'xxl',
      has_dual_zone: true,
      has_app: true,
      has_rotisserie: false,
      has_grill: true,
      short_description: "Un design vertical révolutionnaire avec deux paniers superposés pour gagner 40% de place sur le plan de travail.",
      main_image_url: 'https://m.media-amazon.com/images/I/71Yy%2BG9fHXL._AC_SL1500_.jpg',
      ideal_for: ['Cuisines optimisées', 'Grandes Familles', 'Tech Lovers'],
      specs: { has_dual_zone: true, has_app: true, modes: ['Turbo', 'Roast', 'Bake'], dishwasher_safe: true },
      rating_overall: 9.1,
      rating_cooking: 9.2,
      rating_quality: 9,
      rating_ease_of_use: 9,
      rating_value: 8.8,
    },
    {
      slug: 'ninja-crispi-portable',
      name: 'Ninja Crispi Portable Cooking System',
      brand_slug: 'ninja',
      min_price: 160,
      max_price: 160,
      capacity_liters: 4.0,
      wattage: 1500,
      type: 'compact',
      has_dual_zone: false,
      has_app: false,
      has_rotisserie: false,
      has_grill: false,
      short_description: "Le concept Cook & Go par excellence. Cuisez directement dans des récipients en verre hermétiques haute qualité.",
      main_image_url: 'https://m.media-amazon.com/images/I/71JzO6gUf%2BL._AC_SL1500_.jpg',
      ideal_for: ['Étudiants', 'Batch Cooking', 'Meal Prep'],
      specs: { has_dual_zone: false, has_app: false, modes: ['Max Crisp'], dishwasher_safe: true },
      rating_overall: 8.5,
      rating_cooking: 8.5,
      rating_quality: 8.5,
      rating_ease_of_use: 9,
      rating_value: 8.5,
    },
    {
      slug: 'cosori-twinfry-10l',
      name: 'Cosori TwinFry 10L Dual Blaze',
      brand_slug: 'cosori',
      min_price: 270,
      max_price: 300,
      capacity_liters: 10.0,
      wattage: 2800,
      type: 'xxl',
      has_dual_zone: true,
      has_app: true,
      has_rotisserie: false,
      has_grill: true,
      short_description: "Une paroi amovible transforme ce monstre de 10L en deux zones de 5L. Technologie Dual Blaze.",
      main_image_url: 'https://m.media-amazon.com/images/I/71u%2BDq-DqLL._AC_SL1500_.jpg',
      ideal_for: ['Chefs Exigeants', 'Flexibilité Totale'],
      specs: { has_dual_zone: true, has_app: true, modes: ['Airfry', 'Roast'], dishwasher_safe: true },
      rating_overall: 9.4,
      rating_cooking: 9.5,
      rating_quality: 9.2,
      rating_ease_of_use: 9.5,
      rating_value: 9.2,
    },
    // Produits avec images Amazon (liste fournie) – prix mis à jour
    {
      slug: 'moulinex-easy-fry-grill-vision-ez506820',
      name: 'Moulinex Easy Fry & Grill Vision EZ506820',
      brand_slug: 'moulinex',
      min_price: 75,
      max_price: 75,
      capacity_liters: 4.6,
      wattage: 1550,
      type: 'family',
      has_dual_zone: false,
      has_app: false,
      has_rotisserie: false,
      has_grill: true,
      short_description: 'Friteuse sans huile 2-en-1 (air fryer + gril) avec fenêtre transparente amovible. Capacité 4,6 L pour jusqu\'à 6 personnes. Technologie Extra Crisp, 8 programmes automatiques, 1550W.',
      main_image_url: 'https://m.media-amazon.com/images/I/717ic2tAFEL._AC_SL1500_.jpg',
      ideal_for: ['Familles', 'Gril', 'Surveillance cuisson'],
      specs: { has_grill: true, has_window: true, programmes: 8, reparabilite: '15 ans' },
      rating_overall: 8.6,
      rating_cooking: 8.8,
      rating_quality: 8.5,
      rating_ease_of_use: 8.5,
      rating_value: 8.5,
    },
    {
      slug: 'moulinex-easy-fry-essential-inox-8-3l',
      name: 'Moulinex Easy Fry Essential Inox 8,3L',
      brand_slug: 'moulinex',
      min_price: 99,
      max_price: 100,
      capacity_liters: 8.3,
      wattage: 1800,
      type: 'xxl',
      has_dual_zone: false,
      has_app: true,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile grande capacité 8,3 L pour jusqu\'à 8 personnes. 7 programmes intuitifs avec application smartphone pour contrôle à distance et synchronisation.',
      main_image_url: 'https://m.media-amazon.com/images/I/71YbD%2BG2ZJL._AC_SL1500_.jpg',
      ideal_for: ['Grandes familles', 'Application', 'Repas complets'],
      specs: { has_app: true, programmes: 7 },
      rating_overall: 8.7,
      rating_cooking: 8.8,
      rating_quality: 8.5,
      rating_ease_of_use: 9,
      rating_value: 8.5,
    },
    {
      slug: 'moulinex-easy-fry-pop-terracotta-5l',
      name: 'Moulinex Easy Fry POP TERRACOTTA 5L',
      brand_slug: 'moulinex',
      min_price: 59,
      max_price: 60,
      capacity_liters: 5,
      wattage: 1500,
      type: 'family',
      has_dual_zone: false,
      has_app: false,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile design terracotta, 5L pour 6 personnes. Écran tactile digital, 10 programmes intuitifs. Économe en énergie, design moderne.',
      main_image_url: 'https://m.media-amazon.com/images/I/71vwJqkXDCL._AC_SL1500_.jpg',
      ideal_for: ['Design', 'Économie d\'énergie', '6 personnes'],
      specs: { programmes: 10 },
      rating_overall: 8.4,
      rating_cooking: 8.5,
      rating_quality: 8.3,
      rating_ease_of_use: 8.5,
      rating_value: 8.5,
    },
    {
      slug: 'ninja-flexdrawer-air-fryer-6-6l',
      name: 'Ninja FlexDrawer Air Fryer 6,6L',
      brand_slug: 'ninja',
      min_price: 119,
      max_price: 120,
      capacity_liters: 6.6,
      wattage: 1700,
      type: 'family',
      has_dual_zone: true,
      has_app: false,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile avec système FlexDrawer et double bac, 6,6L. Multifonction 6-en-1 : frire, rôtir, réchauffer, déshydrater. Design noir compact.',
      main_image_url: 'https://m.media-amazon.com/images/I/71nZ3yXxKML._AC_SL1500_.jpg',
      ideal_for: ['Double bac', 'Multifonction', 'Gain de place'],
      specs: { has_dual_zone: true, fonctions: 6 },
      rating_overall: 8.8,
      rating_cooking: 9,
      rating_quality: 8.5,
      rating_ease_of_use: 8.5,
      rating_value: 8.5,
    },
    {
      slug: 'cecotec-cecofry-fantastik-5500',
      name: 'Cecotec Friteuse Sans Huile Cecofry Fantastik 5500',
      brand_slug: 'cecotec',
      min_price: 41,
      max_price: 42,
      capacity_liters: 5.5,
      wattage: 1500,
      type: 'family',
      has_dual_zone: false,
      has_app: false,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile 5,5L, 1500W. Technologie PerfectCook, 9 modes de cuisson. Protection surchauffe. Excellent rapport qualité-prix.',
      main_image_url: 'https://m.media-amazon.com/images/I/61Kt5kQxfqL._AC_SL1500_.jpg',
      ideal_for: ['Petit budget', 'Cuisson uniforme', '9 modes'],
      specs: { modes: 9 },
      rating_overall: 8.2,
      rating_cooking: 8.3,
      rating_quality: 8,
      rating_ease_of_use: 8.5,
      rating_value: 9,
    },
    {
      slug: 'moulinex-easy-fry-mega-7-5l',
      name: 'Moulinex Easy Fry Mega 7,5L',
      brand_slug: 'moulinex',
      min_price: 79,
      max_price: 80,
      capacity_liters: 7.5,
      wattage: 1700,
      type: 'xxl',
      has_dual_zone: false,
      has_app: false,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile très grande capacité 7,5L, format compact, mono tiroir pour 8 personnes. 8 programmes, design noir. Cuisson 2x plus rapide qu\'un four.',
      main_image_url: 'https://m.media-amazon.com/images/I/71KvbqYLBRL._AC_SL1500_.jpg',
      ideal_for: ['Grande capacité', 'Compact', '8 personnes'],
      specs: { programmes: 8 },
      rating_overall: 8.6,
      rating_cooking: 8.7,
      rating_quality: 8.5,
      rating_ease_of_use: 8.5,
      rating_value: 8.5,
    },
    {
      slug: 'ninja-double-stack-xl-air-fryer',
      name: 'NINJA Double Stack XL Air Fryer Verticale',
      brand_slug: 'ninja',
      min_price: 189,
      max_price: 190,
      capacity_liters: 9.5,
      wattage: 2400,
      type: 'xxl',
      has_dual_zone: true,
      has_app: false,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile verticale, 2 compartiments, 4 niveaux, 9,5L. Format compact -60% d\'espace. 6 fonctions. Idéal grandes familles.',
      main_image_url: 'https://m.media-amazon.com/images/I/81SJYt48OtL._AC_SL1500_.jpg',
      ideal_for: ['Vertical', 'Grandes familles', 'Gain de place'],
      specs: { has_dual_zone: true, niveaux: 4, fonctions: 6 },
      rating_overall: 9,
      rating_cooking: 9.2,
      rating_quality: 8.8,
      rating_ease_of_use: 9,
      rating_value: 8.8,
    },
    {
      slug: 'cosori-air-fryer-10l-twinfry',
      name: 'COSORI Air Fryer 10L TwinFry',
      brand_slug: 'cosori',
      min_price: 199,
      max_price: 200,
      capacity_liters: 10,
      wattage: 2400,
      type: 'xxl',
      has_dual_zone: true,
      has_app: true,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile double zone 10L, double résistance, séparateur amovible. Application VeSync, recettes. Technologie Dual Zone brevetée.',
      main_image_url: 'https://m.media-amazon.com/images/I/71Q7hXp3k8L._AC_SL1500_.jpg',
      ideal_for: ['Dual Zone', 'Application', '10L'],
      specs: { has_dual_zone: true, has_app: true },
      rating_overall: 9.2,
      rating_cooking: 9.3,
      rating_quality: 9,
      rating_ease_of_use: 9,
      rating_value: 9,
    },
    {
      slug: 'russell-hobbs-air-fryer-rapid-air-4-3l',
      name: 'Russell Hobbs Air Fryer Rapid Air 4,3L',
      brand_slug: 'russell-hobbs',
      min_price: 54,
      max_price: 55,
      capacity_liters: 4.3,
      wattage: 1400,
      type: 'compact',
      has_dual_zone: false,
      has_app: false,
      has_rotisserie: false,
      has_grill: true,
      short_description: 'Friteuse sans huile ultra compacte et silencieuse 4,3L. Cuisson, gril, rôtissage. Écran tactile, arrêt auto, pièces lave-vaisselle. Économe.',
      main_image_url: 'https://m.media-amazon.com/images/I/71xdqCh-tIL._AC_SL1500_.jpg',
      ideal_for: ['Compact', 'Silencieux', 'Petit budget'],
      specs: { has_grill: true },
      rating_overall: 8.3,
      rating_cooking: 8.4,
      rating_quality: 8.2,
      rating_ease_of_use: 8.5,
      rating_value: 8.5,
    },
    {
      slug: 'friteuse-sans-huile-10l-2-tiroir',
      name: 'Friteuse sans Huile 10L 2 Tiroir',
      brand_slug: 'autres',
      min_price: 75,
      max_price: 76,
      capacity_liters: 10,
      wattage: 1800,
      type: 'xxl',
      has_dual_zone: true,
      has_app: false,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile double tiroir 10L, 2 compartiments indépendants. 9 programmes en 1, max 230°C, fenêtre visible, écran LCD.',
      main_image_url: 'https://m.media-amazon.com/images/I/71fSEy%2BdPoL._AC_SL1500_.jpg',
      ideal_for: ['Double tiroir', '10L', 'Polyvalent'],
      specs: { has_dual_zone: true, has_window: true, programmes: 9 },
      rating_overall: 8.1,
      rating_cooking: 8.2,
      rating_quality: 8,
      rating_ease_of_use: 8.5,
      rating_value: 8.5,
    },
    // Liste enrichie – 4 nouveaux produits (11–14)
    {
      slug: 'moulinex-easy-fry-dual-flex-9l',
      name: 'Moulinex Easy Fry Dual Flex 9L',
      brand_slug: 'moulinex',
      min_price: 129,
      max_price: 130,
      capacity_liters: 9,
      wattage: 2000,
      type: 'xxl',
      has_dual_zone: true,
      has_app: true,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile grand tiroir 9L, double zone, séparateur amovible. Jusqu\'à 8 personnes, 7 programmes intuitifs. Design noir, écran de contrôle moderne.',
      main_image_url: 'https://m.media-amazon.com/images/I/71Pb0kYKRqL._AC_SL1500_.jpg',
      ideal_for: ['Double zone', 'Grande famille', 'Repas complets'],
      specs: { has_dual_zone: true, has_app: true, programmes: 7 },
      rating_overall: 8.8,
      rating_cooking: 9,
      rating_quality: 8.5,
      rating_ease_of_use: 8.5,
      rating_value: 8.5,
    },
    {
      slug: 'philips-airfryer-serie-2000-4-2l',
      name: 'Philips Airfryer Série 2000 - 4.2L',
      brand_slug: 'philips',
      min_price: 83,
      max_price: 84,
      capacity_liters: 4.2,
      wattage: 1400,
      type: 'compact',
      has_dual_zone: false,
      has_app: false,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Air fryer Philips 4,2L, technologie RapidAir, jusqu\'à 90% de matières grasses en moins. 13 modes de cuisson, écran tactile. Design compact et moderne.',
      main_image_url: 'https://m.media-amazon.com/images/I/61YHx8DKNQL._AC_SL1500_.jpg',
      ideal_for: ['Compact', 'RapidAir', '13 modes'],
      specs: { programmes: 13 },
      rating_overall: 8.5,
      rating_cooking: 8.7,
      rating_quality: 8.5,
      rating_ease_of_use: 8.5,
      rating_value: 8.5,
    },
    {
      slug: 'philips-airfryer-serie-3000-double-panier-9l',
      name: 'Philips Airfryer Série 3000 Double Panier 9L',
      brand_slug: 'philips',
      min_price: 129,
      max_price: 129,
      capacity_liters: 9,
      wattage: 2400,
      type: 'xxl',
      has_dual_zone: true,
      has_app: true,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile double panier 9L, technologie RapidAir. Smart Sync pour terminer les deux paniers ensemble. Application HomeID, lave-vaisselle.',
      main_image_url: 'https://m.media-amazon.com/images/I/71hnp0LZMCL._AC_SL1500_.jpg',
      ideal_for: ['Double panier', 'Application HomeID', 'Grande famille'],
      specs: { has_dual_zone: true, has_app: true, dishwasher_safe: true },
      rating_overall: 9,
      rating_cooking: 9.2,
      rating_quality: 8.8,
      rating_ease_of_use: 9,
      rating_value: 8.8,
    },
    {
      slug: 'ninja-air-fryer-3-8l-4-en-1',
      name: 'NINJA Air Fryer 3,8L - 4-en-1',
      brand_slug: 'ninja',
      min_price: 69,
      max_price: 90,
      capacity_liters: 3.8,
      wattage: 1500,
      type: 'compact',
      has_dual_zone: false,
      has_app: false,
      has_rotisserie: false,
      has_grill: false,
      short_description: 'Friteuse sans huile compacte 3,8L, 4-en-1 : Air Fry, Rôtir, Réchauffer, Déshydrater. 2-4 portions, panier lave-vaisselle. Digitale, gris et noir.',
      main_image_url: 'https://m.media-amazon.com/images/I/718NLTlCvLL._AC_UL320_.jpg',
      ideal_for: ['Compact', '2-4 portions', '4 fonctions'],
      specs: { fonctions: 4, dishwasher_safe: true },
      rating_overall: 8.4,
      rating_cooking: 8.5,
      rating_quality: 8.3,
      rating_ease_of_use: 8.5,
      rating_value: 8.5,
    },
  ];

  console.log('... Insertion des produits');
  for (const p of products) {
    const { brand_slug, ...rest } = p;
    const row = {
      ...rest,
      brand_id: brandMap.get(brand_slug),
      is_published: true,
      is_featured: p.rating_overall >= 9,
    };
    const { data: inserted, error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      console.error(`❌ Erreur insert ${p.name}:`, error.message);
      continue;
    }
    console.log(`✅ Produit inséré: ${p.name}`);
  }

  console.log('🏁 Seed terminé avec succès !');
}

seed().catch((e) => console.error(e));
