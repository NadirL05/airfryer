# Configuration Supabase

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Où trouver ces valeurs ?

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Structure de la base de données

Le projet utilise les tables suivantes :
- `products` : Catalogue des air fryers
- `brands` : Marques (Ninja, Philips, Cosori, etc.)
- `v_products_with_brand` : Vue pour les produits avec infos de marque

Les migrations sont disponibles dans `supabase/migrations/`.
