import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceBoxProps {
  minPrice: number | null;
  maxPrice: number | null;
  affiliateUrl?: string | null;
  className?: string;
}

export function PriceBox({
  minPrice,
  maxPrice,
  affiliateUrl,
  className,
}: PriceBoxProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const displayPrice =
    minPrice && maxPrice && minPrice !== maxPrice
      ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
      : minPrice
        ? formatPrice(minPrice)
        : maxPrice
          ? formatPrice(maxPrice)
          : "Prix non disponible";

  return (
    <Card className={cn("border-2 border-primary/20", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Prix</p>
            <p className="text-4xl font-bold text-primary">{displayPrice}</p>
            {minPrice && maxPrice && minPrice !== maxPrice && (
              <p className="text-xs text-muted-foreground mt-1">
                Prix indicatif selon les vendeurs
              </p>
            )}
          </div>

          {affiliateUrl && (
            <Button
              size="lg"
              className="w-full"
              asChild
            >
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center justify-center gap-2"
              >
                Voir sur Amazon
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Prix mis à jour le {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
