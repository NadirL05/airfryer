# 🧑‍💻 Exemples d'Utilisation - Interface Admin

## 1️⃣ Utiliser les Server Actions dans un Nouveau Composant

### Exemple : Carte Produit avec Édition Rapide Prix

```typescript
'use client'

import { useState } from 'react'
import { updateProductPrice } from '@/app/actions/admin-products'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function QuickPriceEditor({ productId, initialPrice }: {
  productId: string
  initialPrice: number
}) {
  const [price, setPrice] = useState(initialPrice.toString())
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      toast({
        title: 'Erreur',
        description: 'Prix invalide',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const result = await updateProductPrice(productId, numPrice)

    if (result.success) {
      toast({ title: '✅ Prix mis à jour' })
      setIsEditing(false)
    } else {
      toast({
        title: 'Erreur',
        description: result.error,
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-bold">{initialPrice}€</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          Modifier
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        disabled={loading}
        className="w-24"
      />
      <Button onClick={handleSave} disabled={loading} size="sm">
        Sauver
      </Button>
      <Button
        onClick={() => {
          setPrice(initialPrice.toString())
          setIsEditing(false)
        }}
        disabled={loading}
        size="sm"
        variant="ghost"
      >
        Annuler
      </Button>
    </div>
  )
}
```

## 2️⃣ Action Batch - Mettre à Jour Plusieurs Produits

### Exemple : Appliquer une Réduction sur Plusieurs Produits

```typescript
'use client'

import { updateProductPrice } from '@/app/actions/admin-products'
import { useToast } from '@/hooks/use-toast'

export function BatchPriceUpdate({ products }: {
  products: Array<{ id: string; price: number }>
}) {
  const { toast } = useToast()

  const applyDiscount = async (discountPercent: number) => {
    toast({ title: 'Mise à jour en cours...' })

    const updates = products.map(async (product) => {
      const newPrice = product.price * (1 - discountPercent / 100)
      return updateProductPrice(product.id, newPrice)
    })

    const results = await Promise.all(updates)
    const successful = results.filter(r => r.success).length
    const failed = results.length - successful

    toast({
      title: `✅ ${successful} produits mis à jour`,
      description: failed > 0 ? `${failed} erreurs` : undefined,
    })
  }

  return (
    <div className="space-y-2">
      <h3>Appliquer une réduction</h3>
      <div className="flex gap-2">
        <button onClick={() => applyDiscount(10)}>-10%</button>
        <button onClick={() => applyDiscount(20)}>-20%</button>
        <button onClick={() => applyDiscount(30)}>-30%</button>
      </div>
    </div>
  )
}
```

## 3️⃣ Composant avec Validation Avancée

### Exemple : Formulaire Produit avec Validation Complète

```typescript
'use client'

import { useState } from 'react'
import { createProduct } from '@/app/actions/admin-products'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(3, 'Nom trop court'),
  model: z.string().min(2, 'Modèle requis'),
  price: z.number().min(0.01, 'Prix doit être > 0'),
  affiliate_url: z.string().url('URL invalide').optional(),
})

export function ValidatedProductForm({ brands }: {
  brands: Array<{ id: string; name: string }>
}) {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    brand_id: '',
    price: '',
    affiliate_url: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation avec Zod
    const validation = productSchema.safeParse({
      ...formData,
      price: parseFloat(formData.price),
    })

    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message
      })
      setErrors(newErrors)
      return
    }

    // Server Action
    const result = await createProduct({
      ...formData,
      price: parseFloat(formData.price),
    })

    if (result.success) {
      toast({ title: '✅ Produit créé', description: `ID: ${result.data}` })
      // Reset form
      setFormData({
        name: '',
        model: '',
        brand_id: '',
        price: '',
        affiliate_url: '',
      })
    } else {
      toast({
        title: 'Erreur',
        description: result.error,
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Nom</label>
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* Autres champs... */}

      <button type="submit">Créer Produit</button>
    </form>
  )
}
```

## 4️⃣ Hook Personnalisé pour Actions Produits

### Exemple : useProductActions

```typescript
import { useState } from 'react'
import {
  updateProductPrice,
  updateProductLink,
  toggleProductVisibility,
  deleteProduct,
} from '@/app/actions/admin-products'
import { useToast } from '@/hooks/use-toast'

export function useProductActions(productId: string) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const updatePrice = async (price: number) => {
    setLoading(true)
    const result = await updateProductPrice(productId, price)

    if (result.success) {
      toast({ title: 'Prix mis à jour' })
    } else {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    }
    setLoading(false)
    return result.success
  }

  const updateLink = async (url: string) => {
    setLoading(true)
    const result = await updateProductLink(productId, url)

    if (result.success) {
      toast({ title: 'Lien mis à jour' })
    } else {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    }
    setLoading(false)
    return result.success
  }

  const toggleVisibility = async () => {
    setLoading(true)
    const result = await toggleProductVisibility(productId)

    if (result.success) {
      toast({
        title: result.data ? 'Produit publié' : 'Produit masqué',
      })
    } else {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    }
    setLoading(false)
    return result.success ? result.data : null
  }

  const remove = async () => {
    setLoading(true)
    const result = await deleteProduct(productId)

    if (result.success) {
      toast({ title: 'Produit supprimé' })
    } else {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    }
    setLoading(false)
    return result.success
  }

  return {
    loading,
    updatePrice,
    updateLink,
    toggleVisibility,
    remove,
  }
}

// Utilisation
function ProductCard({ product }) {
  const actions = useProductActions(product.id)

  return (
    <div>
      <button
        onClick={() => actions.updatePrice(99.99)}
        disabled={actions.loading}
      >
        Mettre à 99.99€
      </button>
      <button
        onClick={actions.toggleVisibility}
        disabled={actions.loading}
      >
        Toggle Visibilité
      </button>
    </div>
  )
}
```

## 5️⃣ Composant de Nettoyage URL

### Exemple : URL Cleaner Preview

```typescript
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'

// Copie de la fonction cleanAmazonUrl pour preview côté client
function cleanAmazonUrl(url: string): string {
  if (!url || !url.includes('amazon')) return url

  try {
    const urlObj = new URL(url)
    const dpMatch = urlObj.pathname.match(/\/dp\/([A-Z0-9]{10})/)
    const productMatch = urlObj.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/)

    const asin = dpMatch?.[1] || productMatch?.[1]
    if (!asin) return url

    const tag = urlObj.searchParams.get('tag')
    const cleanedUrl = new URL(`${urlObj.origin}/dp/${asin}`)
    if (tag) cleanedUrl.searchParams.set('tag', tag)

    return cleanedUrl.toString()
  } catch {
    return url
  }
}

export function UrlCleanerPreview() {
  const [url, setUrl] = useState('')

  const cleanedUrl = cleanAmazonUrl(url)
  const isCleaned = url !== cleanedUrl && url.length > 0

  return (
    <div className="space-y-4 p-4 border rounded">
      <div>
        <label className="font-semibold">URL Amazon (longue)</label>
        <Input
          type="url"
          placeholder="https://www.amazon.fr/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {isCleaned && (
        <div className="bg-green-50 p-3 rounded">
          <label className="font-semibold text-green-800">✅ URL Nettoyée</label>
          <p className="text-sm font-mono text-green-900 break-all">
            {cleanedUrl}
          </p>
          <p className="text-xs text-green-700 mt-2">
            Réduction : {url.length} → {cleanedUrl.length} caractères
            ({Math.round((1 - cleanedUrl.length / url.length) * 100)}% plus court)
          </p>
        </div>
      )}
    </div>
  )
}
```

## 6️⃣ Composant avec Debouncing

### Exemple : Recherche Produits avec Auto-Save

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/use-debounce' // à créer
import { updateProductLink } from '@/app/actions/admin-products'

export function DebouncedLinkEditor({ productId, initialUrl }: {
  productId: string
  initialUrl: string
}) {
  const [url, setUrl] = useState(initialUrl)
  const debouncedUrl = useDebounce(url, 1000) // 1s delay

  useEffect(() => {
    if (debouncedUrl !== initialUrl && debouncedUrl.length > 0) {
      updateProductLink(productId, debouncedUrl)
        .then((result) => {
          if (result.success) {
            console.log('✅ Auto-saved')
          }
        })
    }
  }, [debouncedUrl, productId, initialUrl])

  return (
    <div className="relative">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Lien Amazon..."
      />
      {url !== debouncedUrl && (
        <span className="absolute right-2 top-2 text-xs text-gray-400">
          Sauvegarde...
        </span>
      )}
    </div>
  )
}

// Hook useDebounce simple
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

## 7️⃣ Tests avec Jest

### Exemple : Test d'une Server Action

```typescript
// __tests__/actions/admin-products.test.ts
import { updateProductPrice } from '@/app/actions/admin-products'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
    })),
  })),
}))

describe('updateProductPrice', () => {
  it('devrait accepter un prix valide', async () => {
    const result = await updateProductPrice('test-id', 99.99)
    expect(result.success).toBe(true)
  })

  it('devrait rejeter un prix négatif', async () => {
    const result = await updateProductPrice('test-id', -10)
    expect(result.success).toBe(false)
    expect(result.error).toContain('positif')
  })

  it('devrait rejeter un prix à 0', async () => {
    const result = await updateProductPrice('test-id', 0)
    expect(result.success).toBe(false)
  })
})
```

---

Ces exemples couvrent les cas d'usage les plus courants et montrent comment étendre l'interface admin avec de nouvelles fonctionnalités.
