import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ComparePageClient } from "@/components/compare/compare-page";

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
  return <ComparePageClient />;
}

