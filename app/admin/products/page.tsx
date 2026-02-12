import { createClient } from '@/lib/supabase/server'
import { ProductsTable } from './products-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Admin - Produits | Airfryer',
  description: 'Gestion des produits et liens d\'affiliation',
}

async function getProducts() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(id, name, slug, logo_url)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return products
}

async function getBrands() {
  const supabase = await createClient()

  const { data: brands, error } = await supabase
    .from('brands')
    .select('id, name, slug')
    .order('name')

  if (error) {
    console.error('Error fetching brands:', error)
    return []
  }

  return brands
}

export default async function AdminProductsPage() {
  const [products, brands] = await Promise.all([
    getProducts(),
    getBrands(),
  ])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des Produits
          </h1>
          <p className="text-muted-foreground mt-2">
            {products.length} produit{products.length > 1 ? 's' : ''} au total
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/">
              Retour au site
            </Link>
          </Button>
        </div>
      </div>

      <ProductsTable products={products} brands={brands} />
    </div>
  )
}
