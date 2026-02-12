'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createProduct } from '@/app/actions/admin-products'
import { Loader2 } from 'lucide-react'

type CreateProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  brands: { id: string; name: string; slug: string }[]
}

export function CreateProductDialog({
  open,
  onOpenChange,
  brands,
}: CreateProductDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    brand_id: '',
    price: '',
    capacity: '',
    power: '',
    affiliate_url: '',
    image_url: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      brand_id: '',
      price: '',
      capacity: '',
      power: '',
      affiliate_url: '',
      image_url: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.model || !formData.brand_id || !formData.price) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      })
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un prix valide.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    const productData = {
      name: formData.name,
      model: formData.model,
      brand_id: formData.brand_id,
      price,
      capacity: formData.capacity ? parseFloat(formData.capacity) : undefined,
      power: formData.power ? parseInt(formData.power) : undefined,
      affiliate_url: formData.affiliate_url || undefined,
      image_url: formData.image_url || undefined,
    }

    const result = await createProduct(productData)

    if (result.success) {
      toast({
        title: 'Produit créé',
        description: 'Le produit a été créé avec succès.',
      })
      resetForm()
      onOpenChange(false)
    } else {
      toast({
        title: 'Erreur',
        description: result.error,
        variant: 'destructive',
      })
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau produit</DialogTitle>
          <DialogDescription>
            Remplissez les informations du produit. Les champs marqués d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom du produit <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Air Fryer XXL"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            {/* Modèle */}
            <div className="space-y-2">
              <Label htmlFor="model">
                Modèle <span className="text-destructive">*</span>
              </Label>
              <Input
                id="model"
                placeholder="Ex: AF-3000"
                value={formData.model}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, model: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Marque */}
          <div className="space-y-2">
            <Label htmlFor="brand">
              Marque <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.brand_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, brand_id: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une marque" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Prix */}
            <div className="space-y-2">
              <Label htmlFor="price">
                Prix (€) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="99.99"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                required
              />
            </div>

            {/* Capacité */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité (L)</Label>
              <Input
                id="capacity"
                type="number"
                step="0.1"
                placeholder="3.8"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, capacity: e.target.value }))
                }
              />
            </div>

            {/* Puissance */}
            <div className="space-y-2">
              <Label htmlFor="power">Puissance (W)</Label>
              <Input
                id="power"
                type="number"
                placeholder="1500"
                value={formData.power}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, power: e.target.value }))
                }
              />
            </div>
          </div>

          {/* URL de l'image */}
          <div className="space-y-2">
            <Label htmlFor="image_url">URL de l'image</Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://..."
              value={formData.image_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, image_url: e.target.value }))
              }
            />
            {formData.image_url && (
              <div className="mt-2 border rounded-lg p-2">
                <img
                  src={formData.image_url}
                  alt="Aperçu"
                  className="max-h-32 mx-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Lien d'affiliation */}
          <div className="space-y-2">
            <Label htmlFor="affiliate_url">Lien d'affiliation Amazon</Label>
            <Input
              id="affiliate_url"
              type="url"
              placeholder="https://www.amazon.fr/..."
              value={formData.affiliate_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, affiliate_url: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Le lien sera automatiquement nettoyé pour ne garder que l'essentiel
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le produit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
