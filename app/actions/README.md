# Server Actions - Documentation

## 📁 Structure
Les Server Actions sont organisées par domaine fonctionnel dans `app/actions/`.

## 🔧 Actions Disponibles

### Admin Products (`admin-products.ts`)

#### `updateProductLink(id: string, affiliateUrl: string)`
Met à jour le lien d'affiliation d'un produit.

**Features** :
- Nettoyage automatique des URLs Amazon
- Extraction ASIN + conservation du tag d'affiliation
- Revalidation automatique du cache

**Exemple** :
```typescript
import { updateProductLink } from '@/app/actions/admin-products'

const result = await updateProductLink(
  'product-id-123',
  'https://www.amazon.fr/dp/B0BXXX?tag=mon-tag-21'
)

if (result.success) {
  console.log('Lien mis à jour !')
} else {
  console.error('Erreur:', result.error)
}
```

#### `updateProductPrice(id: string, price: number)`
Met à jour le prix d'un produit.

**Validation** :
- Prix doit être > 0
- Nombre valide (pas NaN)

**Exemple** :
```typescript
const result = await updateProductPrice('product-id-123', 149.99)
```

#### `toggleProductVisibility(id: string)`
Bascule le statut `is_published` d'un produit.

**Retour** :
```typescript
{
  success: true,
  data: true // nouveau statut (true = publié, false = masqué)
}
```

#### `deleteProduct(id: string)`
Supprime un produit de façon permanente.

**⚠️ Attention** : Action irréversible !

#### `createProduct(data: ProductData)`
Crée un nouveau produit.

**Type** :
```typescript
type ProductData = {
  name: string           // Obligatoire
  model: string          // Obligatoire
  brand_id: string       // Obligatoire
  price: number          // Obligatoire
  capacity?: number      // Optionnel (en litres)
  power?: number         // Optionnel (en watts)
  features?: string[]    // Optionnel
  affiliate_url?: string // Optionnel
  image_url?: string     // Optionnel
}
```

**Retour** :
```typescript
{
  success: true,
  data: 'new-product-id'
}
```

## 🛠️ Utilisation dans un Composant Client

### Hook de Base
```typescript
'use client'

import { useState } from 'react'
import { updateProductPrice } from '@/app/actions/admin-products'
import { useToast } from '@/hooks/use-toast'

export function PriceEditor({ productId, currentPrice }) {
  const [price, setPrice] = useState(currentPrice)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setLoading(true)
    const result = await updateProductPrice(productId, price)

    if (result.success) {
      toast({ title: 'Prix sauvegardé' })
    } else {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <input
      type="number"
      value={price}
      onChange={(e) => setPrice(parseFloat(e.target.value))}
      onBlur={handleSave}
      disabled={loading}
    />
  )
}
```

## 🔄 Revalidation du Cache

Toutes les Server Actions qui modifient les produits invalident automatiquement :
- `/admin/products` : Page admin
- `/comparateur` : Page comparateur

**Exemple** :
```typescript
// Dans la Server Action
revalidatePath('/admin/products')
revalidatePath('/comparateur')
```

Cela garantit que les données affichées sont toujours à jour.

## 🧪 Tests

### Test Unitaire d'une Action
```typescript
import { updateProductPrice } from '@/app/actions/admin-products'

describe('updateProductPrice', () => {
  it('devrait refuser un prix négatif', async () => {
    const result = await updateProductPrice('test-id', -10)
    expect(result.success).toBe(false)
    expect(result.error).toContain('positif')
  })
})
```

## 🎯 Bonnes Pratiques

### 1. Gestion d'Erreurs
Toujours vérifier `result.success` :
```typescript
const result = await updateProductLink(id, url)
if (!result.success) {
  // Gérer l'erreur
  return
}
// Continuer
```

### 2. Loading States
Désactiver les inputs pendant le chargement :
```typescript
const [loading, setLoading] = useState(false)

const handleAction = async () => {
  setLoading(true)
  try {
    await myAction()
  } finally {
    setLoading(false)
  }
}
```

### 3. Feedback Utilisateur
Toujours afficher un feedback (toast, modal, etc.) :
```typescript
if (result.success) {
  toast({ title: 'Succès !' })
} else {
  toast({ title: 'Erreur', description: result.error })
}
```

## 📝 Type ActionResult

Toutes les Server Actions utilisent ce type de retour :
```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

**Avantages** :
- Type-safe
- Gestion d'erreurs cohérente
- Facile à consommer dans les composants

## 🔐 Sécurité

Les Server Actions :
- ✅ S'exécutent côté serveur uniquement
- ✅ Utilisent les variables d'environnement sécurisées
- ✅ Valident toutes les entrées
- ✅ Gèrent les erreurs de façon sécurisée (pas de leak d'infos sensibles)

**Attention** : Ne jamais exposer de données sensibles dans les messages d'erreur !

## 🚀 Performances

### Optimisation Automatique
- Next.js cache les résultats quand possible
- `revalidatePath` ne regénère que les pages nécessaires
- Les actions sont bundlées séparément (code splitting automatique)

### Parallélisation
Exécuter plusieurs actions en parallèle si indépendantes :
```typescript
const [result1, result2] = await Promise.all([
  updateProductPrice(id1, price1),
  updateProductPrice(id2, price2),
])
```

---

**Note** : Pour ajouter une nouvelle Server Action, suivez le pattern existant dans `admin-products.ts`.
