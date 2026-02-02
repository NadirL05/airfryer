import Link from "next/link";
import { ArrowRight, BookOpen, GitCompare } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardProps } from "@/components/product/product-card";
import { proxyImageUrl } from "@/lib/utils";

const PLACEHOLDER_IMAGE =
  "https://m.media-amazon.com/images/I/717ic2tAFEL._AC_SL1500_.jpg";

interface HomeBentoProps {
  featuredProduct: ProductCardProps | null;
  products: ProductCardProps[];
}

export function HomeBento({ featuredProduct, products }: HomeBentoProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <BentoGrid cols={2} className="auto-rows-fr">
          {/* Carte 1 — Grande gauche : Meilleur Choix 2026 → classement / guide */}
          <BentoCard colSpan={1} rowSpan={2}>
            <Link
              href="/guides/meilleur-air-fryer-double-bac"
              className="group flex h-full flex-col"
            >
              <div className="relative flex-1 overflow-hidden p-6 transition-colors group-hover:bg-muted/30">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proxyImageUrl(featuredProduct?.image_url || PLACEHOLDER_IMAGE, 800)}
                    alt={featuredProduct?.title || "Meilleur air fryer"}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Le Meilleur Choix 2026
                  </span>
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {featuredProduct?.title || "Découvrir les meilleurs modèles"}
                  </h2>
                  {featuredProduct?.score != null && (
                    <p className="text-sm text-muted-foreground">
                      Note : {featuredProduct.score}/10
                    </p>
                  )}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                  Voir le test
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </BentoCard>

          {/* Carte 2 — Haut droite : Guide */}
          <BentoCard colSpan={1} rowSpan={1}>
            <Link
              href="/guides/meilleur-air-fryer-double-bac"
              className="group flex h-full flex-col transition-colors hover:bg-muted/30"
            >
              <div className="flex h-full flex-col p-4">
                {/* Image du guide */}
                <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proxyImageUrl("https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhOjxqc9ANEFlsVdzZC_Cs3Sp1nPLfpdOk_8WUfr-y8p7B2sB2iWMptcibuUuuhaBJyACu92kKxix1EFYaM8cSNeRAKgcD11U3imQL6Mqo6jj66VB3jzulI4BTLCQ5tj69LyOPJWHan9QYKxmwRk3I4E-qNigFrm13qJjJf9ATxwtJzMIpqP9UrDFmnL1Y/s16000-rw/comparatif%20meilleurs%20airfryer.jpg", 600)}
                    alt="Comparatif meilleurs Air Fryers"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/90 text-primary-foreground">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">
                      Guide : Comment choisir ?
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Notre comparatif double bac 2026
                    </p>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                    Lire le guide
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </BentoCard>

          {/* Carte 3 — Bas droite : Comparateur VS */}
          <BentoCard colSpan={1} rowSpan={1}>
            <Link
              href="/compare"
              className="group flex h-full flex-col transition-colors hover:bg-muted/30"
            >
              <div className="flex h-full flex-col justify-between p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition-transform group-hover:scale-105">
                  <GitCompare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Comparateur VS
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comparez 2 ou 3 modèles côte à côte
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                  Lancer le comparatif
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </BentoCard>

          {/* Carte 4 — Bas large : Nos derniers tests */}
          <BentoCard colSpan={2} rowSpan={1} className="p-6 transition-colors hover:bg-muted/20">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">
                Nos derniers tests
              </h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/categorie/family" className="gap-1">
                  Voir tout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </section>
  );
}
