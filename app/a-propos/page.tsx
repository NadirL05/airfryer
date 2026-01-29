import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "À propos",
  description: "Qui sommes-nous - AirFryer Deal, votre guide expert air fryer.",
};

export default function AProposPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-bold">À propos d&apos;AirFryer Deal</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground">
          AirFryer Deal est votre guide expert pour choisir le meilleur air fryer.
          Nous testons les modèles du marché et publions des comparatifs, guides
          d&apos;achat et conseils pour une cuisine saine et croustillante.
        </p>
        <p className="mt-4 text-muted-foreground">
          Ce site participe à des programmes d&apos;affiliation. En tant que
          Partenaire Amazon, nous réalisons un bénéfice sur les achats
          éligibles.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Voir nos comparatifs</Link>
        </Button>
      </div>
    </div>
  );
}
