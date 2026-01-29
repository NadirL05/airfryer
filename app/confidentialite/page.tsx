import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données - AirFryer Deal.",
};

export default function ConfidentialitePage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-bold">Politique de confidentialité</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground">
          AirFryer Deal s&apos;engage à protéger vos données personnelles. Les
          informations collectées via la newsletter ou les formulaires sont
          utilisées uniquement pour vous envoyer nos actualités et ne sont pas
          transmises à des tiers.
        </p>
        <p className="mt-4 text-muted-foreground">
          Conformément au RGPD, vous pouvez demander l&apos;accès, la
          rectification ou la suppression de vos données en nous contactant.
        </p>
      </div>
    </div>
  );
}
