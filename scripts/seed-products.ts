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
    { name: 'Ninja', slug: 'ninja', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Ninja_logo.svg/2560px-Ninja_logo.svg.png' },
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
      main_image_url: 'https://m.media-amazon.com/images/I/71Yy+G9fHXL._AC_SL1500_.jpg',
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
      main_image_url: 'https://m.media-amazon.com/images/I/71JzO6gUf+L._AC_SL1500_.jpg',
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
      main_image_url: 'https://m.media-amazon.com/images/I/71u+Dq-DqLL._AC_SL1500_.jpg',
      ideal_for: ['Chefs Exigeants', 'Flexibilité Totale'],
      specs: { has_dual_zone: true, has_app: true, modes: ['Airfry', 'Roast'], dishwasher_safe: true },
      rating_overall: 9.4,
      rating_cooking: 9.5,
      rating_quality: 9.2,
      rating_ease_of_use: 9.5,
      rating_value: 9.2,
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
