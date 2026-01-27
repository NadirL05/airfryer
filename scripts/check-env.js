// Script de vérification des variables d'environnement
// Exécutez : node scripts/check-env.js

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 Vérification des variables d\'environnement...\n');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL est manquant');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...');
}

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY est manquant');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey.substring(0, 20) + '...');
}

if (supabaseUrl && supabaseKey) {
  console.log('\n✅ Toutes les variables sont configurées !');
  console.log('\n💡 Si vous voyez encore des erreurs, redémarrez le serveur :');
  console.log('   1. Arrêtez le serveur (Ctrl+C)');
  console.log('   2. Relancez : npm run dev\n');
} else {
  console.log('\n❌ Certaines variables sont manquantes.');
  console.log('\n📝 Vérifiez que votre fichier .env.local contient :');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon\n');
}
