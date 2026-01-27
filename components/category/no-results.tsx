"use client";

import { useRouter, usePathname } from "next/navigation";
import { SearchX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoResultsProps {
  title?: string;
  description?: string;
}

export function NoResults({
  title = "Aucun air fryer trouvé",
  description = "Aucun produit ne correspond à vos critères de recherche. Essayez d'élargir vos filtres ou de réinitialiser votre recherche.",
}: NoResultsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleReset = () => {
    // Navigate to the same page without any search params
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 px-6 py-16 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-10 w-10 text-muted-foreground" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-semibold tracking-tight">{title}</h3>

      {/* Description */}
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      {/* Reset CTA */}
      <Button onClick={handleReset} variant="default" size="lg" className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Réinitialiser les filtres
      </Button>

      {/* Suggestions */}
      <div className="mt-8 space-y-2 text-xs text-muted-foreground">
        <p className="font-medium">Suggestions :</p>
        <ul className="space-y-1">
          <li>• Élargissez la fourchette de prix</li>
          <li>• Sélectionnez moins de marques</li>
          <li>• Désactivez certaines fonctionnalités</li>
        </ul>
      </div>
    </div>
  );
}
