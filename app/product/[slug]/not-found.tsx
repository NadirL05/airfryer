import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Package className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-4 text-4xl font-bold">Produit non trouvé</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Le produit que vous recherchez n&apos;existe pas ou n&apos;est plus
        disponible.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/categorie/family">Voir tous les produits</Link>
        </Button>
      </div>
    </div>
  );
}
