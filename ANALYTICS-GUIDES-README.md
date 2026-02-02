# Analytics & Guides - Implémentation Complète

## 📊 1. SYSTÈME ANALYTICS

### Backend (`app/api/track/route.ts`)

**Route API** : `POST /api/track`

**Body attendu** :
```json
{
  "event_name": "affiliate_click",
  "event_data": {
    "source": "sticky_bar",
    "product": "Moulinex Easy Fry",
    "price": "75€"
  }
}
```

**Fonctionnalités** :
- Utilise `SUPABASE_SERVICE_ROLE_KEY` pour écrire sans auth
- Capture automatiquement `user-agent` depuis les headers
- Capture optionnellement `x-session-id` depuis les headers
- Insère dans la table `analytics_events`

### Hook Frontend (`hooks/use-analytics.ts`)

**Utilisation** :
```tsx
import { useAnalytics } from "@/hooks/use-analytics";

function MyComponent() {
  const { track } = useAnalytics();
  
  const handleClick = () => {
    track("affiliate_click", {
      source: "product_page",
      product: "Ninja FlexDrawer",
      price: "119€"
    });
  };
  
  return <button onClick={handleClick}>Voir l'offre</button>;
}
```

**Technologie** :
- `navigator.sendBeacon()` si disponible (non-bloquant, survit au page unload)
- Sinon `fetch()` avec `keepalive: true`

### Exemple d'intégration (`components/product/sticky-product-bar.tsx`)

✅ **Déjà intégré** : Le `StickyProductBar` track automatiquement les clics sur "Voir l'offre"

```tsx
const handleClick = () => {
  track("affiliate_click", {
    source: "sticky_bar",
    product: productTitle,
    price: displayPrice,
  });
};
```

---

## 📚 2. SYSTÈME GUIDES

### Backend (`lib/supabase/queries.ts`)

#### Interface `GuideData`
```typescript
export interface GuideData {
  id: string;
  title: string;
  slug: string;
  intro: string | null;
  content_markdown: string;
  featured_product_ids: string[]; // UUID[]
  main_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Fonction `getGuideBySlug(slug: string)`

**Logique SQL** :
1. Récupère le guide via `.eq("slug", slug).eq("is_published", true)`
2. Si `featured_product_ids` contient des UUIDs :
   - Récupère les produits avec `.in("id", guide.featured_product_ids)`
   - Depuis la vue `v_products_with_brand`
3. Retourne `{ guide, products }`

**Exemple de code** :
```typescript
const result = await getGuideBySlug("meilleurs-air-fryers-2026");
if (result) {
  const { guide, products } = result;
  console.log(guide.title); // "Les 5 Meilleurs Air Fryers 2026"
  console.log(products.length); // 3
}
```

### Frontend (`app/guide/[slug]/page.tsx`)

**Fonctionnalités** :
- ✅ Page dynamique avec ISR (`revalidate = 3600`)
- ✅ Hero avec image de couverture + titre + date
- ✅ Section intro (encadré)
- ✅ Contenu markdown (avec `whitespace-pre-wrap`)
- ✅ Section "Notre Sélection" avec ProductCard pour chaque produit

**Structure** :
```tsx
export const revalidate = 3600; // Cache ISR 1 heure

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getGuideBySlug(slug);
  
  if (!result) notFound();
  
  const { guide, products } = result;
  
  return (
    <div>
      {/* Hero avec image + titre */}
      {/* Intro */}
      {/* Contenu markdown */}
      {/* Produits featured */}
    </div>
  );
}
```

---

## 🎯 3. GUIDES CONFIGURÉS EN BDD

### Guide 1 : "meilleurs-air-fryers-2026"
- **URL** : `/guide/meilleurs-air-fryers-2026`
- **Produits** : 3 produits (Moulinex Vision, Moulinex Essential, Ninja FlexDrawer)

### Guide 2 : "meilleur-air-fryer-double-bac"
- **URL** : `/guide/meilleur-air-fryer-double-bac`
- **Produits** : 3 produits double bac (Ninja Double Stack, COSORI TwinFry, Cosori Dual Blaze)

### Guide 3 : "meilleur-airfryer-famille-2026"
- **URL** : `/guide/meilleur-airfryer-famille-2026`
- **Produits** : 4 produits XXL (Cosori Tower, Ninja Stack, COSORI 10L, Philips 9L)

---

## 🧪 4. TESTS À EFFECTUER

### Test Analytics
```bash
# Test manuel avec curl
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "test_event",
    "event_data": { "page": "home", "action": "click" }
  }'

# Vérifier dans Supabase
SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 10;
```

### Test Guides
1. Naviguer vers `http://localhost:3000/guide/meilleurs-air-fryers-2026`
2. Vérifier :
   - ✅ Hero avec image
   - ✅ Titre du guide
   - ✅ Date de mise à jour
   - ✅ Contenu markdown affiché
   - ✅ 3 ProductCard dans "Notre Sélection"

### Test StickyProductBar avec Analytics
1. Aller sur une page produit (ex: `/product/moulinex-easy-fry-grill-vision-ez506820`)
2. Scroller en bas pour voir apparaître la barre sticky
3. Cliquer sur "Voir l'offre"
4. Vérifier dans Supabase :
```sql
SELECT * FROM analytics_events 
WHERE event_name = 'affiliate_click' 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 📦 5. STRUCTURE DE LA BASE DE DONNÉES

### Table `analytics_events`
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);
```

### Table `guides`
```sql
CREATE TABLE guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  intro TEXT,
  content_markdown TEXT NOT NULL,
  featured_product_ids UUID[] DEFAULT ARRAY[]::UUID[],
  main_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_guides_slug ON guides(slug);
CREATE INDEX idx_guides_published ON guides(is_published) WHERE is_published = TRUE;
```

---

## ✅ CHECKLIST COMPLÈTE

### Backend
- [x] API route `/api/track` créée
- [x] Service role key configurée
- [x] Table `analytics_events` en BDD
- [x] `getGuideBySlug()` avec `.in()` pour produits
- [x] Table `guides` en BDD

### Frontend
- [x] Hook `useAnalytics` créé
- [x] `StickyProductBar` utilise le tracking
- [x] Page guide `/guide/[slug]` créée
- [x] ISR configuré (1h)
- [x] Hero + Markdown + Produits affichés

### Données
- [x] 3 guides créés et publiés
- [x] Produits associés aux guides
- [x] Images valides configurées

---

## 🚀 PROCHAINES ÉTAPES (Optionnel)

1. **Améliorer le Markdown** : Installer `react-markdown` pour un meilleur rendu
   ```bash
   npm install react-markdown remark-gfm
   ```

2. **Dashboard Analytics** : Créer une page admin pour visualiser les événements

3. **Plus de Guides** : Ajouter d'autres guides (ex: "meilleur-air-fryer-compact", "meilleur-air-fryer-connecte")

4. **A/B Testing** : Utiliser les analytics pour tester différentes versions de boutons CTA
