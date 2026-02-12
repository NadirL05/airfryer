'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Met à jour le lien d'affiliation d'un produit
 */
export async function updateProductLink(
  id: string,
  affiliateUrl: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Nettoyer l'URL Amazon si nécessaire
    const cleanedUrl = cleanAmazonUrl(affiliateUrl)

    const { error } = await supabase
      .from('products')
      .update({ affiliate_url: cleanedUrl })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/products')
    revalidatePath('/comparateur')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error updating product link:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du lien'
    }
  }
}

/**
 * Met à jour le prix d'un produit
 */
export async function updateProductPrice(
  id: string,
  price: number
): Promise<ActionResult> {
  try {
    if (price < 0) {
      return { success: false, error: 'Le prix doit être positif' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('products')
      .update({ price })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/products')
    revalidatePath('/comparateur')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error updating product price:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du prix'
    }
  }
}

/**
 * Supprime un produit
 */
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/products')
    revalidatePath('/comparateur')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error deleting product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression du produit'
    }
  }
}

/**
 * Change la visibilité d'un produit (is_published)
 */
export async function toggleProductVisibility(id: string): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createClient()

    // Récupérer l'état actuel
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('is_published')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const newStatus = !product.is_published

    const { error } = await supabase
      .from('products')
      .update({ is_published: newStatus })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/products')
    revalidatePath('/comparateur')

    return { success: true, data: newStatus }
  } catch (error) {
    console.error('Error toggling product visibility:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du changement de visibilité'
    }
  }
}

/**
 * Crée un nouveau produit
 */
export async function createProduct(data: {
  name: string
  model: string
  brand_id: string
  price: number
  capacity?: number
  power?: number
  features?: string[]
  affiliate_url?: string
  image_url?: string
}): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()

    const productData = {
      name: data.name,
      model: data.model,
      brand_id: data.brand_id,
      price: data.price,
      capacity: data.capacity,
      power: data.power,
      features: data.features || [],
      affiliate_url: data.affiliate_url ? cleanAmazonUrl(data.affiliate_url) : null,
      image_url: data.image_url,
      is_published: false, // Non publié par défaut
    }

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert(productData)
      .select('id')
      .single()

    if (error) throw error

    revalidatePath('/admin/products')

    return { success: true, data: newProduct.id }
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la création du produit'
    }
  }
}

/**
 * Nettoie les URLs Amazon pour ne garder que l'essentiel
 * Exemple: https://www.amazon.fr/dp/B0XXXXXX/ref=... -> https://www.amazon.fr/dp/B0XXXXXX?tag=yourTag
 */
function cleanAmazonUrl(url: string): string {
  if (!url || !url.includes('amazon')) {
    return url
  }

  try {
    const urlObj = new URL(url)

    // Extraire l'ASIN (Amazon Standard Identification Number)
    let asin = ''

    // Format: /dp/ASIN ou /gp/product/ASIN
    const dpMatch = urlObj.pathname.match(/\/dp\/([A-Z0-9]{10})/)
    const productMatch = urlObj.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/)

    if (dpMatch) {
      asin = dpMatch[1]
    } else if (productMatch) {
      asin = productMatch[1]
    }

    if (!asin) {
      return url // Si on ne trouve pas d'ASIN, on retourne l'URL originale
    }

    // Conserver le tag d'affiliation s'il existe
    const tag = urlObj.searchParams.get('tag')

    // Construire l'URL nettoyée
    const cleanedUrl = new URL(`${urlObj.origin}/dp/${asin}`)

    if (tag) {
      cleanedUrl.searchParams.set('tag', tag)
    }

    return cleanedUrl.toString()
  } catch (error) {
    console.error('Error cleaning Amazon URL:', error)
    return url // En cas d'erreur, retourner l'URL originale
  }
}
