import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement (.env.local)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Clé admin (service_role) nécessaire pour écrire sans restriction
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes.');
  console.error('Assurez-vous d\'avoir SUPABASE_SERVICE_ROLE_KEY dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const articles = [
  {
    title: "Comparatif : Les 3 Meilleurs Air Fryers Double Bac (2026)",
    slug: "meilleur-air-fryer-double-bac",
    category: "Comparatif",
    excerpt: "Ninja ou Philips ? On a testé les poids lourds du marché. Voici le verdict pour ne pas se tromper.",
    main_image_url: "https://images.unsplash.com/photo-1585307518179-e6c30c1f0dcc?auto=format&fit=crop&q=80&w=1000",
    is_published: true,
    created_at: new Date().toISOString(),
    content: "<p>Ce comparatif est affiché sur la page dédiée /guide/meilleur-air-fryer-double-bac (contenu enrichi et classement produits).</p>",
  },
  {
    title: "Comment nettoyer son Air Fryer en 5 minutes chrono ?",
    slug: "comment-nettoyer-air-fryer-facile",
    excerpt: "Graisse brûlée, résistance encrassée ? Découvrez la méthode ultime pour garder votre appareil comme neuf sans frotter pendant des heures.",
    category: "guide", // conforme au CHECK (guide, recipe, comparison, news)
    main_image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000",
    is_published: true,
    created_at: new Date().toISOString(),
    content: `
      <h2>Pourquoi l'entretien est crucial ?</h2>
      <p>Un Air Fryer mal nettoyé, c'est de la fumée blanche assurée et des odeurs de vieux graillon. Mais pas de panique, voici la méthode express.</p>
      
      <h3>Ce qu'il vous faut :</h3>
      <ul>
        <li>Du liquide vaisselle dégraissant</li>
        <li>Une éponge non abrasive (côté jaune !)</li>
        <li>Une vieille brosse à dents</li>
      </ul>

      <h3>Étape 1 : Le panier et la grille</h3>
      <p>La plupart des modèles (Ninja, Philips, Cosori) passent au lave-vaisselle. Cependant, pour préserver le revêtement antiadhésif, nous recommandons un lavage main à l'eau chaude savonneuse.</p>
      
      <h3>Étape 2 : La résistance (Le secret)</h3>
      <p>Retournez l'appareil (débranché et froid !). Utilisez la brosse à dents humide pour frotter délicatement la résistance en haut. C'est là que la graisse s'accumule et fume.</p>
    `
  },
  {
    title: "Air Fryer vs Four : Lequel est vraiment le plus économique ?",
    slug: "air-fryer-vs-four-consommation-electrique",
    excerpt: "Avec la hausse des prix de l'électricité, faut-il tout cuire au Air Fryer ? Analyse chiffrée de la consommation réelle en 2026.",
    category: "comparison",
    main_image_url: "https://images.unsplash.com/photo-1626139576127-1428bd741e97?auto=format&fit=crop&q=80&w=1000",
    is_published: true,
    created_at: new Date(Date.now() - 86400000).toISOString(), // Hier
    content: `
      <h2>Le match des Watts</h2>
      <p>Sur le papier, un Air Fryer (1500W) semble proche d'un four (2000W+). Mais la différence se joue sur le temps.</p>
      
      <h3>1. Le préchauffage</h3>
      <p>Un four met 10 à 15 minutes à atteindre 200°C. Un Air Fryer ? 2 minutes. C'est déjà 15 minutes d'électricité économisée par repas.</p>
      
      <h3>2. Le volume à chauffer</h3>
      <p>Pourquoi chauffer 60 Litres (four) pour cuire 300g de frites ? L'Air Fryer concentre la chaleur dans un petit espace (4L à 9L), réduisant le temps de cuisson de 30% à 50%.</p>

      <h3>Verdict : Jusqu'à 60% d'économies</h3>
      <p>Pour des petites portions ou des plats rapides, l'Air Fryer est imbattable. Pour un dinde de Noël entière, gardez le four !</p>
    `
  },
  {
    title: "5 Erreurs qui ruinent vos cuissons au Air Fryer",
    slug: "5-erreurs-debutant-air-fryer",
    excerpt: "Frites molles ? Poulet sec ? Vous commettez sûrement l'une de ces 5 erreurs classiques. Voici comment les corriger.",
    category: "guide",
    main_image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=1000",
    is_published: true,
    created_at: new Date(Date.now() - 172800000).toISOString(), // Avant-hier
    content: `
      <h2>1. Surcharger le panier</h2>
      <p>C'est l'erreur N°1. L'air doit circuler. Si vous empilez les frites, celles du milieu seront cuites à la vapeur (donc molles). Secouez le panier toutes les 5 minutes !</p>
      
      <h2>2. Oublier l'huile</h2>
      <p>"Sans huile" ne veut pas dire "Zéro lipide". Une cuillère à soupe d'huile mélangée aux frites fraîches est indispensable pour le croustillant. Pour les surgelés, c'est inutile.</p>

      <h2>3. Ne pas vérifier la cuisson</h2>
      <p>Les temps de cuisson sont plus courts qu'au four. Ouvrez le tiroir ! Ça n'arrête pas la cuisson et ça permet de contrôler.</p>
    `
  }
];

async function seedBlog() {
  console.log('🌱 Démarrage de l\'injection des articles...');

  for (const article of articles) {
    const { error } = await supabase
      .from('articles')
      .upsert(article, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Erreur pour "${article.title}":`, error.message);
    } else {
      console.log(`✅ Article publié : ${article.title}`);
    }
  }
  
  console.log('🏁 Blog rempli avec succès !');
}

seedBlog().catch(e => console.error(e));

