import { Suspense } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { QuickFinder } from "@/components/home/quick-finder";
import { BrandsSection } from "@/components/home/brands-section";
import { LatestTestsSection } from "@/components/home/latest-tests-section";
import { ArticleCard } from "@/components/blog/article-card";
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";
import { getFeaturedProducts, getBrands } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

// Loading component for products
function ProductsLoading() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Nos{" "}
          <span className="text-primary">derniers tests</span>
        </h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Server Component for Products
async function LatestTests() {
  const products = await getFeaturedProducts(4);
  return <LatestTestsSection products={products} />;
}

// Server Component for Brands
async function Brands() {
  const brands = await getBrands(6);
  return <BrandsSection brands={brands} />;
}

// Server Component for latest blog articles
async function LatestArticlesSection() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, main_image_url, category, created_at"
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const posts =
    (data as {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      main_image_url: string | null;
      category: string | null;
      created_at: string | null;
    }[]) || [];

  if (!posts.length) return null;

  return (
    <section className="bg-muted/40 py-12 md:py-16">
      <div className="container space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Nos derniers conseils &amp; recettes
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Astuces d&apos;entretien, comparatifs et idées recettes pour tirer
              le meilleur de votre air fryer.
            </p>
          </div>
          <div>
            <a
              href="/blog"
              className="text-sm font-medium text-primary hover:underline"
            >
              Voir tous les articles
            </a>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard
              key={post.id}
              article={{
                title: post.title,
                slug: post.slug,
                main_image_url: post.main_image_url,
                category: post.category,
                excerpt: post.excerpt,
                created_at: post.created_at,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  // Fetch brands on the server (not wrapped in Suspense as it's fast)
  const brands = await getBrands(6);

  return (
    <>
      <HeroSection />
      <BrandsSection brands={brands} />
      <QuickFinder />
      <Suspense fallback={<ProductsLoading />}>
        <LatestTests />
      </Suspense>
      {/* Latest blog articles */}
      <LatestArticlesSection />
    </>
  );
}
