import { notFound } from "next/navigation";
import type { Metadata } from "next";

import DOMPurify from "isomorphic-dompurify";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

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

// ============================================
// Metadata
// ============================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      "title, excerpt, main_image_url, meta_title, meta_description, created_at"
    )
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
        ? [
            {
              url: article.main_image_url,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
    },
  };
}

// ============================================
// Page
// ============================================

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, content, category, main_image_url, created_at"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const article = data as Article;

  const publishedDate = article.created_at
    ? new Date(article.created_at)
    : null;

  return (
    <div className="container py-8 lg:py-12">
      <article className="mx-auto max-w-3xl">
        {/* Meta (date, category) */}
        <header className="mb-8 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {article.category || "Guide"}
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          {publishedDate && (
            <p className="text-xs text-muted-foreground sm:text-sm">
              Publié le{" "}
              {publishedDate.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </header>

        {/* Main image */}
        {article.main_image_url && (
          <div className="mb-8 overflow-hidden rounded-xl border bg-muted">
            <Image
              src={article.main_image_url}
              alt={article.title}
              width={1200}
              height={630}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mb-6 text-base text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        {/* Content — HTML nettoyé par DOMPurify pour éviter les XSS */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(article.content),
          }}
        />

        {/* Recommended products / bottom CTA */}
        <footer className="mt-10 border-t pt-6">
          <h2 className="mb-3 text-lg font-semibold">
            Produits recommandés
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Prêt à comparer les meilleurs air fryers avant d&apos;acheter ?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/compare">Lancer un comparatif</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/categorie/family">Voir les modèles familiaux</Link>
            </Button>
          </div>
        </footer>
      </article>
    </div>
  );
}

