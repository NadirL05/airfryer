import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement (.env.local)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// ATTENTION : Utilisez la clé SERVICE_ROLE pour le seed (admin rights), pas la clé anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes.');
  console.error('Assurez-vous d\'avoir NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Démarrage du Seed...');

  // 1. MARQUES
  const brands = [
    { name: 'Philips', slug: 'philips', is_featured: true, logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Philips_Logo.svg/2560px-Philips_Logo.svg.png' },
    { name: 'Cosori', slug: 'cosori', is_featured: true, logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Cosori_logo.png/640px-Cosori_logo.png' },
    { name: 'Ninja', slug: 'ninja', is_featured: true, logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Ninja_logo.svg/2560px-Ninja_logo.svg.png' }
  ];

  console.log('... Insertion des marques');
  const { data: insertedBrands, error: brandError } = await supabase
    .from('brands')
    .upsert(brands, { onConflict: 'slug' })
    .select();

  if (brandError) throw brandError;

  // Créer une map pour retrouver les IDs facilement : { 'philips': 'uuid-123', ... }
  const brandMap = new Map(insertedBrands.map(b => [b.slug, b.id]));

  // 2. CATÉGORIES
  const categories = [
    { name: 'Double Panier', slug: 'double-panier' },
    { name: 'Familial (4-6L)', slug: 'familial' },
    { name: 'XXL (6L+)', slug: 'xxl' },
    { name: 'Compact', slug: 'compact' }
  ];

  console.log('... Insertion des catégories');
  const { data: insertedCats, error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' })
    .select();

  if (catError) throw catError;
  const catMap = new Map(insertedCats.map(c => [c.slug, c.id]));

  // 3. PRODUITS
  const products = [
    {
      slug: 'philips-dual-basket-3000',
      title: 'Philips Airfryer Dual Basket Série 3000',
      brand_slug: 'philips',
      price: 179.99,
      original_price: 229.99,
      overall_score: 8.8,
      rating: 4.6,
      capacity_liters: 9.0,
      power_watts: 2750,
      badge_type: 'value',
      badge_text: 'Meilleur Asymétrique',
      main_image_url: 'https://images.philips.com/is/image/PhilipsConsumer/NA352_00-IMS-fr_FR?wid=800&hei=800',
      is_available: true,
      status: 'published',
      short_description: "Le premier Airfryer Philips à deux tiroirs asymétriques (6L + 3L). Idéal pour cuire un poulet entier d'un côté et des légumes.",
      specifications: { has_dual_zone: true, has_app: true, modes: ["Airfry", "Bake", "Grill"], dishwasher_safe: true },
      ideal_for: ['Familles (4-6 pers)', 'Repas Complets', 'Flexibilité'],
      categories: ['double-panier', 'familial']
    },
    {
      slug: 'cosori-turbo-tower-pro',
      title: 'Cosori Turbo Tower Pro Smart 10.8L',
      brand_slug: 'cosori',
      price: 199.99,
      original_price: 249.99,
      overall_score: 9.1,
      rating: 4.8,
      capacity_liters: 10.8,
      power_watts: 2400,
      badge_type: 'best',
      badge_text: 'Innovation Design',
      main_image_url: 'https://m.media-amazon.com/images/I/71Yy+G9fHXL._AC_SL1500_.jpg',
      is_available: true,
      status: 'published',
      short_description: "Un design vertical révolutionnaire avec deux paniers superposés pour gagner 40% de place sur le plan de travail.",
      specifications: { has_dual_zone: true, has_app: true, modes: ["Turbo", "Roast", "Bake"], dishwasher_safe: true },
      ideal_for: ['Cuisines optimisées', 'Grandes Familles', 'Tech Lovers'],
      categories: ['double-panier', 'xxl']
    },
    {
      slug: 'ninja-crispi-portable',
      title: 'Ninja Crispi Portable Cooking System',
      brand_slug: 'ninja',
      price: 159.99,
      original_price: 159.99,
      overall_score: 8.5,
      rating: 4.5,
      capacity_liters: 4.0,
      power_watts: 1500,
      badge_type: 'taste',
      badge_text: 'Tendance 2026',
      main_image_url: 'https://m.media-amazon.com/images/I/71JzO6gUf+L._AC_SL1500_.jpg',
      is_available: true,
      status: 'published',
      short_description: "Le concept Cook & Go par excellence. Cuisez directement dans des récipients en verre hermétiques haute qualité.",
      specifications: { has_dual_zone: false, has_app: false, modes: ["Max Crisp"], dishwasher_safe: true },
      ideal_for: ['Étudiants', 'Batch Cooking', 'Meal Prep'],
      categories: ['compact']
    },
    {
      slug: 'cosori-twinfry-10l',
      title: 'Cosori TwinFry 10L Dual Blaze',
      brand_slug: 'cosori',
      price: 269.99,
      original_price: 299.99,
      overall_score: 9.4,
      rating: 4.9,
      capacity_liters: 10.0,
      power_watts: 2800,
      badge_type: 'best',
      badge_text: 'Top Performance',
      main_image_url: 'https://m.media-amazon.com/images/I/71u+Dq-DqLL._AC_SL1500_.jpg',
      is_available: true,
      status: 'published',
      short_description: "Une paroi amovible transforme ce monstre de 10L en deux zones de 5L. Technologie Dual Blaze.",
      specifications: { has_dual_zone: true, has_app: true, modes: ["Airfry", "Roast"], dishwasher_safe: true },
      ideal_for: ['Chefs Exigeants', 'Flexibilité Totale'],
      categories: ['xxl', 'double-panier']
    }
  ];

  console.log('... Insertion des produits');

  for (const p of products) {
    // 1. Insérer le produit
    const { categories: prodCats, brand_slug, ...productData } = p;
    
    const { data: insertedProduct, error: prodError } = await supabase
      .from('products')
      .upsert({
        ...productData,
        brand_id: brandMap.get(brand_slug),
        published_at: new Date().toISOString()
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (prodError) {
      console.error(`❌ Erreur insert ${p.title}:`, prodError.message);
      continue;
    }

    // 2. Lier les catégories
    if (prodCats && prodCats.length > 0) {
      const links = prodCats.map((slug, index) => ({
        product_id: insertedProduct.id,
        category_id: catMap.get(slug),
        is_primary: index === 0 
      })).filter(l => l.category_id); // Filtre si catégorie non trouvée

      const { error: linkError } = await supabase
        .from('product_categories')
        .upsert(links, { onConflict: 'product_id,category_id' }); // Note: Assurez-vous d'avoir une contrainte unique composite ou gérez les doublons

      if (linkError) console.error(`⚠️ Erreur liaison catégories pour ${p.title}`, linkError.message);
    }
    
    console.log(`✅ Produit inséré: ${p.title}`);
  }

  console.log('🏁 Seed terminé avec succès !');
}

seed().catch(e => console.error(e));
