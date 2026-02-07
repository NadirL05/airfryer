import { notFound } from "next/navigation";
import type { Metadata } from "next";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@/lib/supabase/server";
import { getFeaturedProducts } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { proxyImageUrl } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  main_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("title, excerpt, main_image_url, meta_title, meta_description, created_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return {
      title: "Article introuvable | AirFryerDeal",
      description: "Cet article n'existe pas ou n'est plus disponible.",
    };
  }

  const article = data as Article;
  const baseTitle =
    article.meta_title ||
    `${article.title} - Guides & Recettes Air Fryer | AirFryerDeal`;
  const description =
    article.meta_description ||
    article.excerpt ||
    `Découvrez notre guide complet "${article.title}" sur les air fryers, avec conseils, astuces et recettes.`;

  return {
    title: baseTitle,
    description,
    openGraph: {
      title: baseTitle,
      description,
      type: "article",
      images: article.main_image_url
        ? [{ url: article.main_image_url, width: 1200, height: 630, alt: article.title }]
        : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, content, category, main_image_url, created_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const article = data as Article;
  const publishedDate = article.created_at ? new Date(article.created_at) : null;
  const topProducts = await getFeaturedProducts(3);

  const sanitizedContent = sanitizeHtml(article.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height", "loading"],
      a: ["href", "target", "rel"],
    },
  });

  return (
    <div className="container py-8 lg:py-12">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          <header className="mb-8 text-center">
            {article.category && (
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {article.category}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            {publishedDate && (
              <p className="mt-3 text-sm text-muted-foreground">
                Publié le{" "}
                {publishedDate.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </header>

          {article.main_image_url && (
            <div className="mb-8 overflow-hidden rounded-xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxyImageUrl(article.main_image_url, 1200)}
                alt={article.title}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {article.excerpt && (
            <p className="mb-6 text-center text-base text-muted-foreground">
              {article.excerpt}
            </p>
          )}

          <div
            className="prose prose-lg prose-blog mx-auto max-w-none dark:prose-invert prose-headings:text-foreground prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* CTA fin d'article */}
          <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-semibold">
              Vous cherchez le meilleur Airfryer ?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Découvrez notre comparatif des meilleurs modèles et trouvez celui qui vous correspond.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/compare">Découvrir notre comparatif</Link>
            </Button>
          </div>
        </article>

        {/* Sidebar — Desktop uniquement */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Top 3 Airfryers du moment
            </h2>
            <ul className="space-y-4">
              {topProducts.map((product, index) => (
                <li key={product.id} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {product.title}
                    </Link>
                    {product.score != null && (
                      <p className="text-xs text-muted-foreground">
                        Note : {product.score}/10
                      </p>
                    )}
                    {product.affiliate_url ? (
                      <a
                        href={product.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Voir l&apos;offre
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        href={`/product/${product.slug}`}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Voir le test
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href="/categorie/family">Voir tous les modèles</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
