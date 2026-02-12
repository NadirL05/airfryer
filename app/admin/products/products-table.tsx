'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import {
  updateProductLink,
  updateProductPrice,
  deleteProduct,
  toggleProductVisibility,
} from '@/app/actions/admin-products'
import {
  Eye,
  EyeOff,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { CreateProductDialog } from './create-product-dialog'

type Brand = {
  id: string
  name: string
  slug: string
  logo_url?: string | null
}

type Product = {
  id: string
  name: string
  model: string
  price: number
  affiliate_url?: string | null
  image_url?: string | null
  is_published: boolean
  brand: Brand
}

type ProductsTableProps = {
  products: Product[]
  brands: { id: string; name: string; slug: string }[]
}

export function ProductsTable({ products, brands }: ProductsTableProps) {
  const { toast } = useToast()
  const [editingLinks, setEditingLinks] = useState<Record<string, string>>({})
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [publishStates, setPublishStates] = useState<Record<string, boolean>>({})

  const setLoading = (id: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [id]: loading }))
  }

  // Sauvegarder le lien d'affiliation
  const handleSaveLink = async (id: string, url: string) => {
    setLoading(id, true)
    const result = await updateProductLink(id, url)

    if (result.success) {
      toast({
        title: 'Lien sauvegardé',
        description: 'Le lien d\'affiliation a été mis à jour.',
      })
      // Nettoyer l'état d'édition
      setEditingLinks(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
    } else {
      toast({
        title: 'Erreur',
        description: result.error,
        variant: 'destructive',
      })
    }
    setLoading(id, false)
  }

  // Sauvegarder le prix
  const handleSavePrice = async (id: string, priceStr: string) => {
    const price = parseFloat(priceStr)
    if (isNaN(price)) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un prix valide.',
        variant: 'destructive',
      })
      return
    }

    setLoading(id, true)
    const result = await updateProductPrice(id, price)

    if (result.success) {
      toast({
        title: 'Prix sauvegardé',
        description: 'Le prix a été mis à jour.',
      })
      // Nettoyer l'état d'édition
      setEditingPrices(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
    } else {
      toast({
        title: 'Erreur',
        description: result.error,
        variant: 'destructive',
      })
    }
    setLoading(id, false)
  }

  // Toggle visibilité
  const handleToggleVisibility = async (id: string) => {
    setLoading(id, true)
    const result = await toggleProductVisibility(id)

    if (result.success) {
      // Mettre à jour le state local pour affichage immédiat
      const newStatus = result.data
      setPublishStates(prev => ({ ...prev, [id]: newStatus }))

      console.log('Toggle visibility:', id, 'New status:', newStatus)

      toast({
        title: 'Statut modifié',
        description: newStatus
          ? 'Le produit est maintenant publié.'
          : 'Le produit est maintenant masqué.',
      })
    } else {
      toast({
        title: 'Erreur',
        description: result.error,
        variant: 'destructive',
      })
    }
    setLoading(id, false)
  }

  // Supprimer un produit
  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    setLoading(productToDelete, true)
    const result = await deleteProduct(productToDelete)

    if (result.success) {
      toast({
        title: 'Produit supprimé',
        description: 'Le produit a été supprimé avec succès.',
      })
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } else {
      toast({
        title: 'Erreur',
        description: result.error,
        variant: 'destructive',
      })
    }
    setLoading(productToDelete, false)
  }

  return (
    <>
      <div className="mb-4">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Marque</TableHead>
              <TableHead className="w-[120px]">Prix</TableHead>
              <TableHead className="w-[300px]">Lien Affiliation</TableHead>
              <TableHead className="w-[100px]">Statut</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun produit trouvé. Commencez par en ajouter un !
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const isLoading = loadingStates[product.id]
                const linkValue = editingLinks[product.id] ?? product.affiliate_url ?? ''
                const priceValue = editingPrices[product.id] ?? product.price?.toString() ?? '0'
                const isPublished = product.id in publishStates ? publishStates[product.id] : product.is_published

                return (
                  <TableRow key={product.id} className={isLoading ? 'opacity-50' : ''}>
                    <TableCell>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={product.image_url || undefined} alt={product.name} />
                        <AvatarFallback>
                          {product.brand?.name?.substring(0, 2).toUpperCase() ?? 'PR'}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.model}</div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.brand?.logo_url && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={product.brand.logo_url} alt={product.brand.name} />
                          </Avatar>
                        )}
                        <span className="text-sm">{product.brand?.name ?? 'Sans marque'}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={priceValue}
                        onChange={(e) =>
                          setEditingPrices((prev) => ({
                            ...prev,
                            [product.id]: e.target.value,
                          }))
                        }
                        onBlur={() => {
                          const originalPrice = product.price?.toString() ?? '0'
                          if (priceValue !== originalPrice) {
                            handleSavePrice(product.id, priceValue)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSavePrice(product.id, priceValue)
                          }
                        }}
                        disabled={isLoading}
                        className="w-full"
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="url"
                          placeholder="https://..."
                          value={linkValue}
                          onChange={(e) =>
                            setEditingLinks((prev) => ({
                              ...prev,
                              [product.id]: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            if (linkValue !== (product.affiliate_url ?? '')) {
                              handleSaveLink(product.id, linkValue)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveLink(product.id, linkValue)
                            }
                          }}
                          disabled={isLoading}
                          className="flex-1"
                        />
                        {product.affiliate_url && (
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                          >
                            <a
                              href={product.affiliate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(product.id)}
                        disabled={isLoading}
                        className="hover:bg-transparent"
                        title={isPublished ? "Cliquez pour masquer" : "Cliquez pour publier"}
                      >
                        {isPublished ? (
                          <Badge
                            className="gap-1 cursor-pointer bg-green-500 hover:bg-green-600 text-white transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            Publié
                          </Badge>
                        ) : (
                          <Badge
                            className="gap-1 cursor-pointer bg-red-500 hover:bg-red-600 text-white transition-colors"
                          >
                            <EyeOff className="h-3 w-3" />
                            Masqué
                          </Badge>
                        )}
                      </Button>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setProductToDelete(product.id)
                          setDeleteDialogOpen(true)
                        }}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de création de produit */}
      <CreateProductDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        brands={brands}
      />
    </>
  )
}
