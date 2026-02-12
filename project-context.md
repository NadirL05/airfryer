# Project Context: AirFryerDeal.com

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)

## Design System
- **Primary Color (Teal):** #14B8A6 (Brand Identity)
- **Secondary Color (Orange):** #FB923C (Accents, Call to Actions)
- **Backgrounds:** White (#FFFFFF) & Light Gray (#F9FAFB)
- **Dark Sections:** #1F2937
- **Typography:** Inter or Plus Jakarta Sans. Bold Headings.
- **Radius:** Rounded-xl

## Database Schema Requirements
The app requires the following tables:
1. `products`: id, name, slug, brand (FK), price, rating (0-10), capacity_liters, type (compact/family/xxl), watts, features (jsonb: dual_zone, app_control...), images (array).
2. `brands`: id, name, logo_url.
3. `reviews`: id, product_id, author, rating, content, pros/cons.
4. `articles`: id, title, slug, content, category (guide/recipe).

## Architecture & Layout
### 1. Global Header (Sticky)
- Logo: "AIRFRYER DEAL" (Bold Modern).
- Nav: Dropdowns for "Par Marque", "Par Capacité", "Par Prix", "Par Usage".
- Search: Integrated search bar.

### 2. Homepage Sections
- Hero: "Choisir son air fryer..." + CTA Teal.
- 3 Main Cards: Ninja (Avis), Philips (Tests), Guides (Recettes).
- Brands Grid: Ninja, Philips, Cosori, Tefal, Moulinex, Xiaomi.
- Quick Finder (Grid 5): Compacts, Familiaux, XXL, Fours, Déshydrateurs.
- Latest Reviews: Grid of 4 products.

### 3. Category Page (/air-fryer-familial/)
- Sidebar Filters: Price (Slider), Capacity (Toggle), Power (Slider), Brand (Checkbox), Features (Rotisserie, Grill...), Type.
- Main Grid: Product cards with "Hover to zoom", Badge Capacity, Score /10.

### 4. Product Page (/product-slug/)
- Layout: 2 Columns.
- Left: Gallery + "Avis Express" box.
- Right: Title, Specs Badges (Double Zone), Price Card, Detailed Scores (Cooking/Quality/Usage).
- Content: "Ideal For" icons, "Tech Specs" table, Pros/Cons, Long-form review with H2/H3.

### 5. Admin Dashboard (/admin/products/)
- **Purpose:** Gestion rapide des produits et liens d'affiliation Amazon.
- **Features:**
  - Tableau dense avec édition inline (prix, liens d'affiliation).
  - Auto-sauvegarde lors de onBlur ou Enter.
  - Nettoyage automatique des URLs Amazon (extraction ASIN + tag).
  - Toggle visibilité produits (is_published).
  - Dialog de création rapide de produits.
  - Suppression avec confirmation.
- **Tech:** Server Actions pour toutes les mutations + revalidation cache.