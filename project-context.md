# Contexte Technique : Migration Sofa-Spotter vers Next.js 16

## Source du Projet (Vite)
Ce projet est une migration d'une SPA Vite vers Next.js App Router.

## Design System (Extrait de tailwind.config.ts)
- **Primary Color (Teal):** #14B8A6 (hsl 168 80% 40%)
- **Secondary Color (Orange):** #FB923C (hsl 27 96% 61%)
- **Radius:** 0.75rem
- **Font:** Inter
- **Animations:** accordion-down, accordion-up, fade-in, slide-up, pulse-glow.
- **Breakpoints:** Container centré avec padding 2rem (sm: 640px à 2xl: 1400px).

## Base de Données (Supabase)
Basé sur les migrations `001_initial_schema.sql` et `003_seed_data.sql` :
- **Tables:** products, brands, categories, product_categories, articles, authors, product_pros_cons, product_faqs, user_reviews.
- **Vues:** `v_products_with_brand` (critique pour l'affichage des cartes produits).
- **Fonctions:** `search_products` (Recherche Full Text Search).

## Architecture des Pages à Migrer
1. **Home (`src/pages/Index.tsx`)**: Hero, TrustSignals, FeaturedGrid, LatestTests.
2. **Product (`src/pages/ProductReview.tsx`)**: Détail produit, Specs, PerformanceCircle, Avis.
3. **Category (`src/pages/CategoryPage.tsx`)**: Filtres latéraux, Grille produits.
4. **Blog (`src/pages/BlogIndex.tsx` & `BlogArticle.tsx`)**.

## Composants UI (Shadcn)
Le projet utilise : Button, Card, Badge, Accordion, Sheet (Mobile Menu), Slider (Filtres), Table, Toast, Progress, Tabs.
