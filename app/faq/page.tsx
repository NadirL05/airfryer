import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ Air Fryers - Questions fréquentes | AirFryer Deal",
  description:
    "Réponses aux questions les plus posées sur les air fryers : entretien, capacité, consommation, recettes.",
};

const FAQ_ITEMS = [
  {
    question: "Quelle capacité choisir pour un air fryer ?",
    answer:
      "Pour 1–2 personnes, 3–4 L suffisent. Pour 3–4 personnes, visez 5–6 L. Les familles ou les grandes fritures gagnent à prendre un modèle XXL (7 L et plus) ou un four air fryer.",
  },
  {
    question: "Un air fryer consomme-t-il beaucoup ?",
    answer:
      "En général entre 800 W et 2 200 W selon le modèle. Les cuissons sont courtes (souvent 15–25 min), donc la consommation reste raisonnable par rapport à un four classique.",
  },
  {
    question: "Comment nettoyer son air fryer ?",
    answer:
      "Laissez refroidir, retirez le panier et le bac, lavez à l’eau chaude savonneuse (ou lave-vaisselle si indiqué). Nettoyez l’intérieur avec un chiffon humide. Un entretien régulier évite les odeurs et les résidus.",
  },
  {
    question: "Frites, poulet, gâteau : tout est possible ?",
    answer:
      "Oui. Les air fryers gèrent frites, nuggets, poulet, poisson, légumes et même gâteaux ou quiches. Vérifiez la notice pour les temps et températures selon les aliments.",
  },
];

export default function FAQPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        FAQ Air Fryers
      </h1>
      <p className="mb-10 text-muted-foreground">
        Les réponses aux questions les plus posées sur les friteuses sans huile.
      </p>

      <dl className="space-y-8">
        {FAQ_ITEMS.map((item, index) => (
          <div key={index}>
            <dt className="text-base font-semibold text-foreground">
              {item.question}
            </dt>
            <dd className="mt-2 text-sm text-muted-foreground">{item.answer}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/compare">Comparer les modèles</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/guides">Voir nos guides</Link>
        </Button>
      </div>
    </div>
  );
}
