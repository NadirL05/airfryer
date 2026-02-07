import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/supabase/queries";
import { ProductGallery } from "@/components/product/product-gallery";
import { ScoreCard } from "@/components/product/score-card";
import { TechSpecsTable } from "@/components/product/tech-specs-table";
import { ProsConsList } from "@/components/product/pros-cons-list";
import { PriceBox } from "@/components/product/price-box";
import { AvisExpress } from "@/components/product/avis-express";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ProductJsonLd } from "@/components/seo/product-json-ld";
import { StickyProductBar } from "@/components/product/sticky-product-bar";
import { sanitizeHtml } from "@/lib/sanitize";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produit non trouvé",
      description: "Le produit demandé n'existe pas ou n'est plus disponible.",
    };
  }

  const model = product.name;
  const brand = product.brand_name ?? "";

  const title = `${model} : Test & Avis (2026)`;
  const description =
    product.short_description?.slice(0, 120) ||
    `Est-ce que le ${model} vaut son prix ? Notre verdict complet : scores, avis d'experts, spécifications et prix.`;

  return {
    title,
    description,
    keywords: [
      model,
      "air fryer",
      "test",
      "avis",
      brand,
      "comparatif",
    ].filter(Boolean),
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "article",
      images: product.main_image_url
        ? [
            {
              url: product.main_image_url,
              width: 1200,
              height: 630,
              alt: model,
            },
          ]
        : [],
      publishedTime: (product as any).published_at ?? undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Prepare tech specs for the table
  const techSpecs = [
    { label: "Capacité", value: product.capacity_liters ? `${product.capacity_liters}L` : null },
    { label: "Puissance", value: product.wattage ? `${product.wattage}W` : null },
    { label: "Type", value: product.type || null },
    { label: "Double zone", value: product.has_dual_zone ? "Oui" : "Non" },
    { label: "Application", value: product.has_app ? "Oui" : "Non" },
    { label: "Rôtisserie", value: product.has_rotisserie ? "Oui" : "Non" },
    { label: "Grill", value: product.has_grill ? "Oui" : "Non" },
    { label: "Déshydrateur", value: product.has_dehydrator ? "Oui" : "Non" },
    { label: "Maintien au chaud", value: product.has_keep_warm ? "Oui" : "Non" },
    // Add any additional specs from the JSONB field
    ...(product.specs && typeof product.specs === "object"
      ? Object.entries(product.specs).map(([key, value]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          value: String(value),
        }))
      : []),
  ].filter((spec) => spec.value !== null);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);
  const displayPrice =
    product.min_price != null && product.max_price != null && product.min_price !== product.max_price
      ? `${formatPrice(product.min_price)} - ${formatPrice(product.max_price)}`
      : product.min_price != null
        ? formatPrice(product.min_price)
        : product.max_price != null
          ? formatPrice(product.max_price)
          : "Prix sur le site";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* SEO: Structured Data */}
      <ProductJsonLd product={product} />
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Air Fryers", href: "/categorie/family" },
          { label: product.name },
        ]}
        className="mb-6"
      />

      {/* Main Content - 2 colonnes : Gauche 40% image (sticky), Droite 60% infos */}
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:gap-12">
        {/* Colonne gauche - Image produit (Sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery
            mainImage={product.main_image_url}
            galleryImages={product.images}
          />
        </div>

        {/* Colonne droite - Titre, Note, Prix, CTA Amazon, Description courte */}
        <div className="space-y-6">
          {/* Titre & Marque */}
          <div className="space-y-3">
            {product.brand_name && (
              <Badge variant="outline" className="text-sm">
                {product.brand_name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
              {product.name}
            </h1>
          </div>

          {/* Avis Express - fond solide */}
          <AvisExpress
            overallScore={product.rating_overall}
            shortDescription={product.short_description}
          />

          {/* Notre Test - Scores en barres */}
          <ScoreCard
            globalScore={product.rating_overall}
            cookingScore={product.rating_cooking}
            qualityScore={product.rating_quality}
            usageScore={product.rating_ease_of_use}
            priceScore={product.rating_value}
          />

          {/* Prix + CTA Amazon (énorme et visible) */}
          <PriceBox
            minPrice={product.min_price}
            maxPrice={product.max_price}
            affiliateUrl={product.affiliate_url}
          />
        </div>
      </div>

      {/* Sentinel: barre sticky apparaît après ce point */}
      <div id="product-hero-end" />

      {/* Contenu pleine largeur - sections en Cards fond solide */}
      <div className="mt-12 space-y-8">
        {/* Spécifications techniques */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-foreground">Spécifications techniques</h2>
          </div>
          <div className="p-6 pt-0">
            <TechSpecsTable specs={techSpecs} />
          </div>
        </section>

        {/* Points forts / Points faibles (Notre Test) */}
        {(product.pros.length > 0 || product.cons.length > 0) && (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-foreground">Points forts et points faibles</h2>
            </div>
            <div className="p-6 pt-0">
              <ProsConsList pros={product.pros} cons={product.cons} />
            </div>
          </section>
        )}

        {/* Test complet (contenu long) */}
        {product.description && (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-foreground">Test complet</h2>
            </div>
            <div
              className="p-6 space-y-4 text-foreground leading-relaxed prose-content max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  product.description.replace(/\n/g, "<br />")
                ),
              }}
            />
          </section>
        )}

        {/* Idéal pour */}
        {product.ideal_for && product.ideal_for.length > 0 && (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-foreground">Idéal pour</h2>
            </div>
            <div className="p-6 flex flex-wrap gap-2">
              {product.ideal_for.map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {item}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Barre sticky CTA (affichée uniquement si affiliate_url) */}
      {product.affiliate_url && (
        <StickyProductBar
          productTitle={product.name}
          displayPrice={displayPrice}
          affiliateLink={product.affiliate_url}
          mainImage={product.main_image_url}
        />
      )}
    </div>
  );
}
