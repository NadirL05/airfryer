# 🔧 Guide de Dépannage - Produits Vides / Erreurs 404

## Problème : Les produits ne s'affichent pas / Pages vides

### ✅ Vérifications à faire

#### 1. Vérifier que les produits existent dans la base de données

Exécutez le script de diagnostic :

```bash
npx tsx scripts/check-products.ts
```

Ce script va :
- Vérifier le nombre de produits publiés
- Tester la fonction RPC `get_filtered_products`
- Afficher les produits par type

**Si aucun produit n'est trouvé :**
```bash
# Exécutez le script de seed pour ajouter des produits
npx tsx scripts/seed-products.ts
```

#### 2. Vérifier que les migrations SQL sont appliquées

Les migrations doivent être appliquées dans Supabase :

1. Va sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionne ton projet
3. Va dans **SQL Editor**
4. Exécute les migrations dans l'ordre :
   - `001_initial_schema.sql`
   - `002_seed_brands.sql`
   - `004_advanced_filtering.sql`
   - `006_fix_category_filtering.sql` (nouvelle migration pour corriger le filtrage)

#### 3. Vérifier les variables d'environnement

Assure-toi que `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ton_cle_anon
SUPABASE_SERVICE_ROLE_KEY=ton_cle_service_role  # Pour les scripts
```

#### 4. Vérifier que les produits ont le champ `type` rempli

Les produits doivent avoir le champ `type` avec une de ces valeurs :
- `compact`
- `family`
- `xxl`
- `oven`
- `dehydrator`

Pour vérifier dans Supabase SQL Editor :

```sql
SELECT id, name, type, is_published 
FROM products 
WHERE is_published = TRUE;
```

Si `type` est NULL, mettez-le à jour :

```sql
-- Exemple : mettre à jour les produits sans type
UPDATE products 
SET type = 'family' 
WHERE type IS NULL AND capacity_liters BETWEEN 3 AND 5;
```

### 🐛 Erreurs 404 sur les boutons

Si tu obtiens des 404 en cliquant sur les boutons :

1. **Vérifie que les routes existent :**
   - `/marque/[slug]` ✅ (créée)
   - `/categorie/[slug]` ✅ (créée)
   - `/prix/[slug]` ✅ (créée)
   - `/usage/[slug]` ✅ (créée)
   - `/guides` ✅ (redirige vers `/blog`)

2. **Vérifie les logs du serveur** pour voir quelle route est appelée

3. **Redémarre le serveur de développement :**
   ```bash
   npm run dev
   ```

### 📝 Checklist complète

- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] Migrations SQL appliquées dans Supabase
- [ ] Produits ajoutés via `seed-products.ts`
- [ ] Produits ont le champ `type` rempli
- [ ] Produits sont publiés (`is_published = TRUE`)
- [ ] Marques existent dans la table `brands`
- [ ] Fonction RPC `get_filtered_products` existe et fonctionne
- [ ] Serveur redémarré après les changements

### 🔍 Debug avancé

Si le problème persiste, active les logs détaillés :

1. Vérifie la console du navigateur (F12)
2. Vérifie les logs du serveur Next.js
3. Vérifie les logs Supabase dans le dashboard

Les erreurs RPC sont maintenant mieux loggées avec :
- Les paramètres envoyés
- Le message d'erreur complet
- Le code d'erreur PostgreSQL

### 💡 Solutions rapides

**Produits vides mais pas d'erreur :**
- Vérifie que `is_published = TRUE` sur tes produits
- Vérifie que les filtres ne sont pas trop restrictifs
- Teste sans filtres : `/` (page d'accueil)

**Erreur RPC :**
- Vérifie que la migration `006_fix_category_filtering.sql` est appliquée
- Vérifie que la fonction `get_filtered_products` existe dans Supabase

**Erreur 404 :**
- Vérifie que les fichiers de pages existent dans `app/`
- Redémarre le serveur de développement
- Vérifie que le build passe : `npm run build`
