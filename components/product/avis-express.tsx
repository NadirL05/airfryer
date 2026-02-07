import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvisExpressProps {
  overallScore: number | null;
  shortDescription?: string | null;
  className?: string;
}

export function AvisExpress({
  overallScore,
  shortDescription,
  className,
}: AvisExpressProps) {
  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 7.5) return "Très bon";
    if (score >= 6) return "Bon";
    if (score >= 4) return "Moyen";
    return "Faible";
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-perf-excellent";
    if (score >= 6) return "text-perf-good";
    if (score >= 4) return "text-perf-average";
    return "text-perf-poor";
  };

  return (
    <Card className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Star className="h-5 w-5 text-primary" />
          Avis Express
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {overallScore !== null && (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "text-3xl font-bold",
                getScoreColor(overallScore)
              )}
            >
              {overallScore.toFixed(1)}/10
            </div>
            <div>
              <p className="font-semibold">{getScoreLabel(overallScore)}</p>
              <p className="text-sm text-muted-foreground">
                Score global
              </p>
            </div>
          </div>
        )}

        {shortDescription && (
          <p className="text-sm leading-relaxed text-foreground">
            {shortDescription}
          </p>
        )}

        {!shortDescription && overallScore === null && (
          <p className="text-sm text-muted-foreground">
            Avis en cours de rédaction...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
