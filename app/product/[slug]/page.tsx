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

  const brand = product.brand_name ?? "";
  const model = product.name;

  const baseTitle = brand
    ? `${brand} ${model} : Test & Avis Complet (2026) - AirFryerDeal`
    : `${model} : Test & Avis Complet (2026) - AirFryerDeal`;

  const shortDesc =
    product.short_description ||
    `Découvrez notre test complet de ${model}. Scores détaillés, avis d'experts, spécifications techniques et prix.`;

  const description = `Verdict du test ${model} : ${shortDesc}`;

  return {
    title: baseTitle,
    description,
    keywords: [
      model,
      "air fryer",
      "test",
      "avis",
      brand,
      "comparatif",
    ].filter(Boolean),
    openGraph: {
      title: baseTitle,
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

  return (
    <div className="container py-8">
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

      {/* Main Content - 2 Columns */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left Column - Gallery (Sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery
            mainImage={product.main_image_url}
            galleryImages={product.images}
          />
        </div>

        {/* Right Column - Product Info */}
        <div className="space-y-6">
          {/* Title & Brand */}
          <div className="space-y-3">
            {product.brand_name && (
              <Badge variant="outline" className="text-sm">
                {product.brand_name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>
          </div>

          {/* Avis Express */}
          <AvisExpress
            overallScore={product.rating_overall}
            shortDescription={product.short_description}
          />

          {/* Score Card */}
          <ScoreCard
            globalScore={product.rating_overall}
            cookingScore={product.rating_cooking}
            qualityScore={product.rating_quality}
            usageScore={product.rating_ease_of_use}
            priceScore={product.rating_value}
          />

          {/* Price Box */}
          <PriceBox
            minPrice={product.min_price}
            maxPrice={product.max_price}
            affiliateUrl={product.affiliate_url}
          />
        </div>
      </div>

      {/* Full Width Content Below */}
      <div className="mt-12 space-y-12">
        {/* Tech Specs Table */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Spécifications techniques</h2>
          <TechSpecsTable specs={techSpecs} />
        </section>

        {/* Pros & Cons */}
        {(product.pros.length > 0 || product.cons.length > 0) && (
          <section>
            <h2 className="mb-6 text-2xl font-bold">Points forts et faibles</h2>
            <ProsConsList pros={product.pros} cons={product.cons} />
          </section>
        )}

        {/* Long Form Content */}
        {product.description && (
          <section className="prose-content max-w-none">
            <h2 className="mb-6 text-2xl font-bold">Test complet</h2>
            <div
              className="space-y-4 text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: product.description.replace(/\n/g, "<br />"),
              }}
            />
          </section>
        )}

        {/* Ideal For */}
        {product.ideal_for && product.ideal_for.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold">Idéal pour</h2>
            <div className="flex flex-wrap gap-2">
              {product.ideal_for.map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {item}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
