import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('🔍 Vérification des produits dans la base de données...\n');

  // 1. Vérifier les produits publiés
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, slug, type, is_published, min_price, max_price, brand_id')
    .eq('is_published', true);

  if (productsError) {
    console.error('❌ Erreur lors de la récupération des produits:', productsError.message);
    return;
  }

  console.log(`📦 Produits publiés trouvés: ${products?.length || 0}`);

  if (!products || products.length === 0) {
    console.log('\n⚠️  Aucun produit publié trouvé dans la base de données!');
    console.log('💡 Solution: Exécutez le script seed-products.ts pour ajouter des produits.');
    return;
  }

  // Afficher les premiers produits
  console.log('\n📋 Premiers produits:');
  products.slice(0, 5).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} (type: ${p.type || 'N/A'}, prix: ${p.min_price || 0}€)`);
  });

  // 2. Vérifier les marques
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('id, name, slug');

  if (brandsError) {
    console.error('❌ Erreur lors de la récupération des marques:', brandsError.message);
  } else {
    console.log(`\n🏷️  Marques trouvées: ${brands?.length || 0}`);
  }

  // 3. Tester la fonction RPC get_filtered_products
  console.log('\n🧪 Test de la fonction RPC get_filtered_products...');
  
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_filtered_products', {
    p_min_price: 0,
    p_max_price: 10000,
    p_brand_ids: null,
    p_category_slugs: ['compact'],
    p_features: null,
    p_sort_by: 'score_desc',
    p_page_number: 1,
    p_page_size: 20,
  });

  if (rpcError) {
    console.error('❌ Erreur RPC:', rpcError.message);
    console.error('   Code:', rpcError.code);
    console.error('   Details:', rpcError.details);
    console.error('   Hint:', rpcError.hint);
  } else {
    console.log(`✅ RPC fonctionne! Produits retournés: ${rpcData?.length || 0}`);
    if (rpcData && rpcData.length > 0) {
      console.log(`   Premier produit: ${rpcData[0].name}`);
    }
  }

  // 4. Vérifier les produits par type
  console.log('\n📊 Produits par type:');
  const types = ['compact', 'family', 'xxl', 'oven', 'dehydrator'];
  for (const type of types) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('type', type);
    console.log(`  - ${type}: ${count || 0} produits`);
  }
}

checkProducts().catch(console.error);
