import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLatestArticles } from "@/lib/supabase/queries";
import { GUIDES } from "@/data/guides";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://airfryerdeal.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const routes: MetadataRoute.Sitemap = [];
  const now = new Date();

  // -----------------------------
  // Static routes
  // -----------------------------
  routes.push(
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guide`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }
  );

  // Static guides (/guide/[slug])
  for (const slug of Object.keys(GUIDES)) {
    routes.push({
      url: `${BASE_URL}/guide/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    });
  }

  // -----------------------------
  // Dynamic: Products (/product/[slug])
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
          url: `${BASE_URL}/product/${product.slug}`,
          lastModified: product.updated_at
            ? new Date(product.updated_at)
            : now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("Error generating product URLs for sitemap:", error);
  }

  // -----------------------------
  // Dynamic: Blog articles (/blog/[slug])
  // -----------------------------
  try {
    const articles = await getLatestArticles(500);
    for (const article of articles) {
      if (!article.slug) continue;
      routes.push({
        url: `${BASE_URL}/blog/${article.slug}`,
        lastModified: article.updated_at
          ? new Date(article.updated_at)
          : now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error("Error generating blog URLs for sitemap:", error);
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
          url: `${BASE_URL}/marque/${brand.slug}`,
          lastModified: brand.updated_at
            ? new Date(brand.updated_at)
            : now,
          changeFrequency: "weekly" as const,
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
          url: `${BASE_URL}/categorie/${category.slug}`,
          lastModified: category.updated_at
            ? new Date(category.updated_at)
            : now,
          changeFrequency: "weekly" as const,
          priority: 0.5,
        });
      }
    }
  } catch (error) {
    console.error("Error generating category URLs for sitemap:", error);
  }

  return routes;
}
