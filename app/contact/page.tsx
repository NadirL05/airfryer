import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'équipe AirFryer Deal.",
};

export default function ContactPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-bold">Contact</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground">
          Pour toute question sur nos tests, comparatifs ou partenariats,
          envoyez-nous un message. Nous répondons sous 48 h.
        </p>
        <p className="mt-4 text-muted-foreground">
          <strong>Email :</strong> contact@airfryerdeal.com (exemple)
        </p>
      </div>
    </div>
  );
}
