import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://airfryerdeal.com";

  const supabase = await createClient();

  const routes: MetadataRoute.Sitemap = [];

  const now = new Date();

  // -----------------------------
  // Static routes
  // -----------------------------
  routes.push(
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }
  );

  // -----------------------------
  // Dynamic: Products
  // -----------------------------
  try {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_published", true);

    if (!productsError && products) {
      for (const product of products) {
        if (!product.slug) continue;
        routes.push({
          url: `${baseUrl}/produit/${product.slug}`,
          lastModified: product.updated_at
            ? new Date(product.updated_at)
            : now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("Error generating product URLs for sitemap:", error);
  }

  // -----------------------------
  // Dynamic: Brands
  // -----------------------------
  try {
    const { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select("slug, updated_at");

    if (!brandsError && brands) {
      for (const brand of brands) {
        if (!brand.slug) continue;
        routes.push({
          url: `${baseUrl}/marque/${brand.slug}`,
          lastModified: brand.updated_at
            ? new Date(brand.updated_at)
            : now,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  } catch (error) {
    console.error("Error generating brand URLs for sitemap:", error);
  }

  // -----------------------------
  // Dynamic: Categories
  // -----------------------------
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("slug, updated_at");

    if (!categoriesError && categories) {
      for (const category of categories) {
        if (!category.slug) continue;
        routes.push({
          url: `${baseUrl}/${category.slug}`,
          lastModified: category.updated_at
            ? new Date(category.updated_at)
            : now,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  } catch (error) {
    console.error("Error generating category URLs for sitemap:", error);
  }

  return routes;
}

