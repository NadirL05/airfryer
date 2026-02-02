import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ComparePageClient } from "@/components/compare/compare-page";

const COMPARE_HERO_IMAGE =
  "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=1920";
const QUE_CHOISIR_GUIDE_URL =
  "https://www.quechoisir.org/guide-d-achat-air-fryer-n130986/";

interface ComparePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({
  searchParams,
}: ComparePageProps): Promise<Metadata> {
  const sp = await searchParams;

  const productsParam = getParam(sp, "products");
  const ids =
    productsParam
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean) ?? [];

  // No products: generic title
  if (ids.length === 0) {
    const title = "Comparateur Air Fryer - Créez votre match";
    const description =
      "Comparez les specs, prix et avis de vos air fryers préférés pour faire le meilleur choix.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_products_with_brand")
    .select("name, brand_name")
    .in("id", ids)
    .limit(3);

  if (error || !data || data.length === 0) {
    const title = "Comparateur Air Fryer - Créez votre match";
    const description =
      "Comparez les specs, prix et avis de vos air fryers préférés pour faire le meilleur choix.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
    };
  }

  const products = data as { name: string; brand_name: string | null }[];

  const names = products.map((p) => p.name);

  let title: string;
  if (names.length === 1) {
    title = `${names[0]} - Comparatif Air Fryer 2026`;
  } else if (names.length === 2) {
    title = `${names[0]} vs ${names[1]} - Lequel choisir ?`;
  } else {
    title = `Comparatif : ${names[0]} vs ${names[1]} vs ${names[2]}`;
  }

  // Description with names list
  const namesForDescription =
    names.length === 1
      ? names[0]
      : names.length === 2
      ? `${names[0]} et ${names[1]}`
      : `${names[0]}, ${names[1]} et ${names[2]}`;

  const description = `Comparez les specs, prix et avis de ${namesForDescription} pour faire le meilleur choix.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function ComparePage() {
  return (
    <>
      {/* Bannière principale au-dessus du comparatif — source : UFC-Que Choisir */}
      <section className="relative w-full overflow-hidden bg-muted">
        <div className="relative aspect-[21/9] w-full min-h-[180px] sm:min-h-[220px] md:min-h-[260px]">
          <Image
            src={COMPARE_HERO_IMAGE}
            alt="Air fryer — comparateur et guide d'achat"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-6 md:p-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Comparateur Air Fryer
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/90 sm:text-base">
              Comparez les modèles et trouvez la friteuse sans huile adaptée à vos besoins.
            </p>
            <p className="mt-3 text-xs text-white/80 sm:text-sm">
              Guide d&apos;achat :{" "}
              <Link
                href={QUE_CHOISIR_GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                UFC-Que Choisir — Air fryer, comment choisir sa friteuse électrique sans huile
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="container py-8 text-sm text-muted-foreground">
            Chargement du comparatif...
          </div>
        }
      >
        <ComparePageClient />
      </Suspense>
    </>
  );
}

