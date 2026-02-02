import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGuideBySlug } from "@/lib/supabase/queries";
import { proxyImageUrl } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";

export const revalidate = 3600; // ISR 1 heure

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getGuideBySlug(slug);

  if (!result) {
    return { title: "Guide introuvable" };
  }

  const { guide } = result;
  const title = guide.meta_title || guide.title;
  const description = guide.meta_description || guide.intro?.slice(0, 160) || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: guide.main_image_url ? [{ url: guide.main_image_url }] : [],
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getGuideBySlug(slug);

  if (!result) {
    notFound();
  }

  const { guide, products } = result;

  const formattedDate = guide.created_at
    ? new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(guide.created_at))
    : null;

  return (
    <div className="min-h-screen">
      {/* Hero: Cover image + Title + Date */}
      <section className="relative w-full overflow-hidden bg-muted">
        <div className="relative h-64 w-full sm:h-80 md:h-96">
          {guide.main_image_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={proxyImageUrl(guide.main_image_url, 1920)}
              alt={guide.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8 md:p-10">
            <div className="container mx-auto max-w-5xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/90 sm:text-sm">
                Guide d&apos;achat
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                {guide.title}
              </h1>
              {formattedDate && (
                <p className="mt-2 text-xs text-white/80 sm:text-sm">
                  Mis à jour le {formattedDate}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content: Intro + Markdown */}
      <div className="container max-w-5xl py-8 lg:py-12">
        {guide.intro && (
          <div className="mb-8 rounded-xl border bg-muted/40 p-6 sm:p-8">
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {guide.intro}
            </p>
          </div>
        )}

        {/* Markdown content (prose) */}
        <article className="prose prose-sm max-w-none dark:prose-invert sm:prose-base lg:prose-lg prose-headings:scroll-mt-24 prose-p:leading-relaxed">
          <div className="whitespace-pre-wrap">{guide.content_markdown}</div>
        </article>

        {/* Featured Products Section */}
        {products.length > 0 && (
          <section className="mt-12 space-y-6 border-t pt-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Notre Sélection
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
