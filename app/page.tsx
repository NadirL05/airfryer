import { Suspense } from "react";
import { AnimatedHero } from "@/components/ui/animated-hero";
import { HomeBento } from "@/components/home/home-bento";
import { ProductBrowser } from "@/components/product/product-browser";
import { BrandsSection } from "@/components/home/brands-section";
import { QuizWizard } from "@/components/home/quiz-wizard";
import { ArticleCard } from "@/components/blog/article-card";
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";
import { getFeaturedProducts, getBrands, getProductsForQuiz, getProductsForHomeListing } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function BentoLoading() {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 auto-rows-fr">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-card p-6 animate-pulse min-h-[280px]" />
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-card p-6 animate-pulse min-h-[140px]" />
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-card p-6 animate-pulse min-h-[140px]" />
          <div className="sm:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card p-6 animate-pulse min-h-[320px]" />
        </div>
      </div>
    </section>
  );
}

async function BentoWithData() {
  const products = await getFeaturedProducts(4);
  const featuredProduct = products[0] ?? null;
  return (
    <HomeBento
      featuredProduct={featuredProduct}
      products={products}
    />
  );
}

async function Brands() {
  const brands = await getBrands(6);
  return <BrandsSection brands={brands} />;
}

async function QuizWizardSection() {
  const products = await getProductsForQuiz();
  if (products.length === 0) return null;
  return <QuizWizard products={products} />;
}

async function LatestArticlesSection() {
  try {
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
            <a
              href="/blog"
              className="text-sm font-medium text-primary hover:underline"
            >
              Voir tous les articles
            </a>
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
  } catch (error) {
    console.error("Failed to load articles:", error);
    return null;
  }
}

export default async function Home() {
  const [brands, productsForListing] = await Promise.all([
    getBrands(6),
    getProductsForHomeListing(),
  ]);

  return (
    <>
      <AnimatedHero />
      <Suspense fallback={null}>
        <QuizWizardSection />
      </Suspense>
      <BrandsSection brands={brands} />
      <Suspense fallback={<BentoLoading />}>
        <BentoWithData />
      </Suspense>
      <ProductBrowser initialProducts={productsForListing} />
      <LatestArticlesSection />
    </>
  );
}
