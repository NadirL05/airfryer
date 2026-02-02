import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, GitCompare } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardProps } from "@/components/product/product-card";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1585307518179-e6c30c1f0dcc?auto=format&fit=crop&q=80&w=600";

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
                  <Image
                    src={
                      featuredProduct?.image_url || PLACEHOLDER_IMAGE
                    }
                    alt={featuredProduct?.title || "Meilleur air fryer"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
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
              <div className="flex h-full flex-col justify-between p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Guide : Comment choisir ?
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Notre comparatif double bac 2026
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                  Lire le guide
                  <ArrowRight className="h-4 w-4" />
                </span>
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
