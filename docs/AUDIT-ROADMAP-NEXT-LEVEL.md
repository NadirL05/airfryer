# Rapport d'Audit & Roadmap — AirFryerDeal "Next-Level"

**Rôle :** CTO & Lead Product Designer (niveau Silicon Valley)  
**Périmètre :** `/app`, `/components`, `/lib`, `/data`, Supabase  
**Objectif :** Transformer le MVP en référence absolue du secteur (technique + visuel).

---

## Synthèse exécutive

Le site est **fonctionnel et propre** : stack Next 16 / Supabase cohérente, RLS en place, pas de fuite de clés côté client. En revanche, il reste **très MVP** sur la perf, le design et les features différenciantes. Ce document identifie ce qui est **médiocre** et propose un plan pour viser **excellent**, sans ménagement.

---

# AXE 1 — TECH & PERFORMANCE (The Engine)

## 1.1 Anti-patterns identifiés

| Problème | Où | Impact | Priorité |
|----------|-----|--------|----------|
| **`use client` trop haut** | `Header`, `Footer`, `Logo` sont 100 % client. Tout le shell (nav + footer) est hydraté au premier paint. | TTI et FCP dégradés, JS bundle inutile pour du contenu statique. | 🔴 Haute |
| **Homepage 100 % dynamic** | `export const dynamic = "force-dynamic"` + `createClient()` avec `cookies()` sur la home. | Aucun cache CDN, chaque visite refait Supabase. | 🔴 Haute |
| **Fetching non dédupliqué** | `getBrands(6)` appelé 2× sur la home (Brands + dans le composant parent), pas de `unstable_cache`. | Requêtes en double, pas de revalidation intelligente. | 🟠 Moyenne |
| **Pas de loading boundaries ciblés** | Seul `LatestTests` est dans Suspense ; `LatestArticlesSection` et le hero ne le sont pas. | Un seul bloc lent bloque toute la page. | 🟠 Moyenne |
| **Données nav en dur** | Header : `brands`, `capacities`, `priceRanges` en constantes JS. | Pas de single source of truth, pas de i18n ni d’évolution par CMS. | 🟡 Basse |

**Verdict :** Architecture globalement correcte (Server Components majoritaires, données en server), mais **front lourd** (Header/Footer client) et **stratégie de cache inexistante**.

---

## 1.2 Partial Prerendering (PPR) & cache

| État actuel | Cible |
|-------------|--------|
| Aucun PPR, aucune config `experimental`. | Activer PPR pour les routes listables (home, blog, catégories) : shell statique + trous dynamiques (produits, articles). |
| Aucun `unstable_cache` dans les queries. | Envelopper `getFeaturedProducts`, `getBrands`, `getFilteredProducts` dans `unstable_cache` avec `revalidate: 60` (ou 300) pour réduire la charge Supabase et améliorer la vitesse perçue. |
| Home `force-dynamic`. | Supprimer `force-dynamic` sur la home ; utiliser `cookies()` uniquement dans les composants qui en ont besoin (ex. panier/favoris) ou accepter un shell statique + données en streaming. |

**Plan concret :**

1. **Next.config :** `experimental: { ppr: true }` (ou équivalent Next 16) et tester sur `/`, `/blog`, `/[category]`.
2. **lib/supabase/queries.ts :** Ajouter `unstable_cache` autour des fonctions de lecture (featured products, brands, articles récents) avec TTL 60–300 s.
3. **Home :** Découper en blocs Suspense (Hero statique, Brands cacheable, Products streamés, Articles streamés) pour que le shell s’affiche immédiatement.

---

## 1.3 Images

| Problème | Où | Action |
|----------|-----|--------|
| **Placeholder générique** | ProductCard / ArticleCard utilisent une même URL Unsplash en fallback. | Remplacer par un placeholder blur (base64) ou `placeholder="blur"` + petite image locale pour éviter le layout shift et le “copier-coller” visuel. |
| **Pas de `priority`** | Hero et premières product cards. | Mettre `priority` sur le premier visuel hero et sur les 4 premières images de la grille produits. |
| **`sizes` approximatifs** | Plusieurs composants. | Ajuster `sizes` (ex. `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`) pour coller aux vraies grilles et éviter le sur-dimensionnement. |

---

## 1.4 Sécurité (Zod, RLS, API)

| Zone | État | Risque | Action |
|------|------|--------|--------|
| **RLS** | En place sur `products`, `articles`, `brands` (lecture publique, écriture service_role). | Faible. | Vérifier que `reviews` et toute future table utilisateur ont des policies explicites. |
| **Validation des entrées** | API newsletter : `typeof body?.email === "string"` + trim. Pas de Zod. | Moyen : pas de format email strict, pas de rate limit. | Introduire Zod pour le body (`z.object({ email: z.string().email() })`) et un rate limit (Upstash ou middleware) sur `POST /api/newsletter`. |
| **Search params / slugs** | Paramètres URL utilisés tels quels (slug, category, brands). | Faible si Supabase échappe. | Optionnel : schémas Zod pour `searchParams` sur les pages sensibles (ex. compare, category) pour rejeter les valeurs invalides. |

**Verdict :** Pas de grosse faille, mais **aucune couche de validation structurée** (Zod) ni de **rate limiting** sur les API publiques. À traiter avant montée en charge.

---

# AXE 2 — UI/UX & DESIGN (The Look)

## 2.1 Identité visuelle : “trop basique”

| Élément | Actuel | Problème |
|---------|--------|----------|
| **Typo** | Inter partout. | Lisible mais générique, pas de hiérarchie “premium”. |
| **Couleurs** | Teal + orange, variables bien définies. | Peu de profondeur (dégradés, états hover/active) et pas d’usage systématique de la “dark section”. |
| **Cartes** | Border + shadow légère. | Pas de glassmorphism, pas de bento, peu de hiérarchie visuelle. |
| **Espacements** | Container + sections classiques. | Rythme vertical répétitif, peu de “respiration” premium. |

**Recommandations :**

- **Typographie :** Garder Inter pour le corps, ajouter une **display font** (ex. Cal Sans, Clash Display, ou Satoshi) pour les titres H1 / hero et les chiffres (scores, prix). Variable CSS `--font-display`.
- **Glassmorphism ciblé :** Header sticky avec `backdrop-blur` + bordure légère ; cartes “highlight” (ex. meilleur choix) avec fond semi-transparent et blur.
- **Bento grids :** Sur la home, remplacer une grille uniforme par un **bento** : 1 grande carte “édito”, 2–3 cartes produits, 1 carte guide ou CTA. Donne un rythme éditorial fort.
- **Micro-détails :** Bordures avec `border-primary/20`, ombres colorées (`shadow-primary/10`), états hover avec léger scale ou glow sur les CTAs.

---

## 2.2 Framer Motion (ou équivalent)

**Non présent aujourd’hui.** Pour un effet “next-level” sans tout réécrire :

| Zone | Usage proposé | Bénéfice |
|------|----------------|----------|
| **Hero** | Titre et sous-titre en `fadeIn` + léger `y`, délai échelonné. | Impact immédiat au chargement. |
| **Grilles (home, catégories)** | `staggerChildren` sur les cartes produits / articles. | Sensation de fluidité et de qualité. |
| **Boutons / CTAs** | `whileHover` (scale 1.02), `whileTap` (scale 0.98). | Feedback tactile clair. |
| **Sticky bar (produit)** | Déjà en CSS transition ; optionnel : `AnimatePresence` pour l’entrée/sortie. | Cohérence avec le reste des transitions. |
| **Navigation / modales** | Transitions de page (layoutId ou vue simple) entre liste → fiche produit. | Expérience “app-like”. |

**Priorité :** Hero + grilles en premier ; boutons et pages ensuite. Garder un **bundle raisonnable** (lazy-load Framer Motion sur les routes qui en ont besoin si nécessaire).

---

## 2.3 Mobile : sticky bars & bottom sheets

| Élément | Actuel | Cible |
|---------|--------|--------|
| **Sticky CTA** | Déjà en place sur la fiche produit (après 300px). | Conserver ; ajouter un état “réduit” (icône + prix) quand on scroll encore pour ne pas masquer le contenu. |
| **Filtres catégorie** | Sheet sur mobile (ou sidebar). | S’assurer que le sheet ouvre/ferme avec une animation fluide et que les filtres appliqués sont visibles sans rouvrir (badges ou résumé en haut de la grille). |
| **Comparateur** | Barre fixe en bas avec produits. | Sur mobile, transformer en **bottom sheet** : au tap, la sheet monte avec la liste des produits comparés + bouton “Voir le comparatif”. Plus “native” et moins encombrant. |
| **Navigation** | Menu burger → sheet. | Déjà cohérent ; ajouter des séparateurs et regroupements (Catégories / Marques / Guides) pour une lecture rapide. |

**Verdict :** La base mobile est là ; il manque un **langage d’interaction** clair (sheets, états réduits, feedback) pour la rendre “addictive” et rassurante.

---

# AXE 3 — FEATURES (The Value)

## 3.1 Historique des prix (Recharts)

| Aspect | Proposition |
|--------|-------------|
| **Données** | Nouvelle table `product_price_history` (product_id, price, source, recorded_at) ou agrégation depuis un job externe (scraping / API partenaire). Supabase + Edge Function ou cron pour l’alimentation. |
| **UI** | Composant dédié sur la fiche produit : “Évolution du prix” avec courbe Recharts (LineChart). Option : seuil “bon prix” (moyenne mobile ou percentile). |
| **SEO / partage** | Pas d’impact direct ; possible snippet “Prix actuel : X € (baisse de Y % sur 30 jours)” pour les extraits riches. |

**Priorité :** Moyenne–haute si la concurrence ne le fait pas ; sinon différenciation forte.

---

## 3.2 Comparateur dynamique “Versus”

| Aspect | Proposition |
|--------|-------------|
| **État actuel** | Page compare avec produits passés en query string ; affichage côte à côte. | Déjà une base solide. |
| **Évolution “Versus”** | Mode **2 produits uniquement** : vue “face à face” (spec par spec), avec indicateur visuel (gagnant / ex aequo) par ligne. Possibilité d’URL type `/compare/ninja-af400 vs philips-xxl`. |
| **Technique** | Même store Zustand ; nouvelle vue “Versus” en plus de la vue “liste”. Composant `CompareVersusView` avec grille 2 colonnes + lignes de specs. |
| **Mobile** | Swipe horizontal entre les 2 fiches ou tableau scrollable horizontal. |

**Priorité :** Haute — peu de coût, forte valeur perçue et partage (liens “Ninja vs Philips”).

---

## 3.3 AI Search (recherche sémantique)

| Aspect | Proposition |
|--------|-------------|
| **Objectif** | Requête du type “Je veux un air fryer pour 4 personnes pas cher” → mapping vers filtres (capacité, prix) + éventuellement recherche full-text. |
| **Option A (sans LLM)** | NER + règles : extraction de “4 personnes” → capacité 4–5 L ; “pas cher” → max_price 150. Puis appel à `getFilteredProducts` existant. Stack : librairie NLP légère ou regex + dictionnaire. |
| **Option B (avec LLM)** | Un seul champ de recherche ; envoi à un endpoint (API Route) qui appelle un modèle (OpenAI / Claude / modèle hébergé). Le modèle retourne un JSON structuré (capacité, budget, options). L’appelant transforme ça en `ProductFilterOptions` et redirige vers `/[category]?min_price=...&capacity=...` ou appelle `getFilteredProducts` côté serveur. |
| **UX** | Garder la command palette (Cmd+K) ; en première position, une “recherche intelligente” qui peut soit afficher des résultats directs, soit “Appliquer les filtres” vers la page catégorie. |

**Priorité :** Haute pour la différenciation ; commencer par **Option A** (règles + filtres) pour valider le besoin, puis Option B si le trafic le justifie.

---

# LIVRABLE — Tableau de priorité

## Ce qui est **médiocre** → **excellent**

| # | Domaine | Médiocre aujourd’hui | Pour viser excellent |
|---|---------|------------------------|----------------------|
| 1 | Perf home | Home 100 % dynamic, pas de cache | PPR + `unstable_cache` sur brands/products/articles + Suspense par bloc |
| 2 | Shell client | Header + Footer entièrement client | Header/Footer en Server Components avec îlots client (menu, search, newsletter) |
| 3 | Images | Fallback unique, pas de priority | Blur placeholders, `priority` sur hero + premières cartes, `sizes` précis |
| 4 | API newsletter | Validation basique, pas de rate limit | Zod + rate limit + message d’erreur explicite |
| 5 | Design | Look “template” | Display font, glassmorphism header, bento home, ombres/états hover |
| 6 | Animations | Quasi aucune | Framer Motion : hero, grilles, CTAs ; transitions de page optionnelles |
| 7 | Mobile | Sticky + sheet OK mais basique | Bottom sheet comparateur, sticky CTA “réduit”, filtres résumés visibles |
| 8 | Données différenciantes | Aucun historique prix | Table + job prix, composant Recharts sur fiche produit |
| 9 | Comparateur | Liste côte à côte | Mode Versus 2 produits avec indicateurs gagnant/ex aequo |
| 10 | Recherche | Filtres manuels + command palette | Recherche “naturelle” (règles puis LLM) → filtres appliqués automatiquement |

---

## Ordre de bataille suggéré (roadmap)

**Phase 1 — Fondations (1–2 sprints)**  
- Cache : `unstable_cache` sur les queries principales.  
- Réduire le client : découper Header/Footer en Server + îlots client.  
- Images : priority + placeholders blur.  
- Newsletter API : Zod + rate limit.

**Phase 2 — Design & ressenti (1–2 sprints)**  
- Identité : display font, bento home, glassmorphism header.  
- Framer Motion : hero + grilles + CTAs.  
- Mobile : bottom sheet comparateur, sticky CTA optimisé.

**Phase 3 — Features différenciantes (2–3 sprints)**  
- Comparateur Versus (2 produits face à face).  
- Historique des prix (schema + UI Recharts).  
- AI Search : v1 par règles (capacité, budget) puis option LLM.

---

*Rapport généré pour AirFryerDeal — Audit & Roadmap Next-Level. Aucun code modifié ; implémentation à planifier en sprints.*
