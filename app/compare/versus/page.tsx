import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getProductsByIds } from "@/lib/supabase/queries";
import { VersusView } from "@/components/compare/versus-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getIdsFromVs(
  searchParams: Record<string, string | string[] | undefined>
): string[] {
  const vs = searchParams.vs;
  const raw = Array.isArray(vs) ? vs[0] : vs;
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 2);
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const sp = await searchParams;
  const ids = getIdsFromVs(sp);

  if (ids.length < 2) {
    return {
      title: "Comparateur Duel | Versus",
      description:
        "Comparez 2 air fryers côte à côte. Prix, puissance, capacité et avis.",
    };
  }

  const products = await getProductsByIds(ids);
  if (products.length < 2) {
    return {
      title: "Comparateur Duel | Versus",
      description:
        "Comparez 2 air fryers côte à côte. Prix, puissance, capacité et avis.",
    };
  }

  const [a, b] = products;
  const title = `${a.name} vs ${b.name} : Le Duel (2026)`;
  const description = `Comparatif complet : Lequel est le meilleur ? Prix, Puissance, Capacité et avis. ${a.name} vs ${b.name}.`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "website" },
  };
}

async function VersusContent({ searchParams }: Props) {
  const sp = await searchParams;
  const ids = getIdsFromVs(sp);

  if (ids.length < 2) {
    return (
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-card p-8 text-center shadow-sm dark:border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight">
            Comparateur Duel (Versus)
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajoutez 2 produits à comparer via l&apos;URL :{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              /compare/versus?vs=id1,id2
            </code>
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link href="/compare">
              <ArrowLeft className="h-4 w-4" />
              Retour au comparateur
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const products = await getProductsByIds(ids);

  if (products.length < 2) {
    return (
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-card p-8 text-center shadow-sm dark:border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight">
            Produits introuvables
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Les produits demandés n&apos;existent pas ou ne sont plus
            disponibles.
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link href="/compare">
              <ArrowLeft className="h-4 w-4" />
              Retour au comparateur
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const productA = products[0];
  const productB = products[1];
  return (
    <>
      <div className="container flex items-center justify-between gap-4 border-b border-slate-200/80 py-4 dark:border-slate-800">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/compare">
            <ArrowLeft className="h-4 w-4" />
            Retour au comparateur
          </Link>
        </Button>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          {productA.name} vs {productB.name}
        </h1>
        <div className="w-24 flex-shrink-0" aria-hidden />
      </div>
      <VersusView products={[productA, productB]} />
    </>
  );
}

function VersusLoading() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-bold text-primary animate-pulse">
        VS
      </div>
      <p className="text-sm text-muted-foreground">Chargement du duel...</p>
    </div>
  );
}

export default function VersusPage(props: Props) {
  return (
    <Suspense fallback={<VersusLoading />}>
      <VersusContent {...props} />
    </Suspense>
  );
}
