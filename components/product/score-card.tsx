import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  globalScore: number | null;
  cookingScore?: number | null;
  qualityScore?: number | null;
  usageScore?: number | null;
  priceScore?: number | null;
}

export function ScoreCard({
  globalScore,
  cookingScore,
  qualityScore,
  usageScore,
  priceScore,
}: ScoreCardProps) {
  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 8) return "Très Bon";
    if (score >= 6) return "Bon";
    if (score >= 4) return "Moyen";
    return "Faible";
  };

  const getScoreColor = (score: number) => {
    if (score > 8) return "text-perf-excellent";
    if (score > 5) return "text-perf-average";
    return "text-perf-poor";
  };

  const getProgressColor = (score: number) => {
    if (score > 8) return "bg-perf-excellent";
    if (score > 5) return "bg-perf-average";
    return "bg-perf-poor";
  };

  const scores = [
    {
      label: "Performance Cuisson",
      value: cookingScore,
      key: "cooking",
    },
    {
      label: "Qualité",
      value: qualityScore,
      key: "quality",
    },
    {
      label: "Facilité d'utilisation",
      value: usageScore,
      key: "usage",
    },
    {
      label: "Rapport Qualité/Prix",
      value: priceScore,
      key: "price",
    },
  ];

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
      {/* Header with Badge and Label */}
      {globalScore !== null && (
        <CardHeader className="p-0 pb-6">
          <div className="flex items-center gap-4">
            {/* Big Badge - Circle */}
            <div
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white",
                globalScore > 8
                  ? "bg-perf-excellent"
                  : globalScore > 5
                    ? "bg-perf-average"
                    : "bg-perf-poor"
              )}
            >
              {globalScore.toFixed(1)}
            </div>
            {/* Label */}
            <div>
              <p className="text-2xl font-bold">{getScoreLabel(globalScore)}</p>
              <p className="text-sm text-muted-foreground">Score global / 10</p>
            </div>
          </div>
        </CardHeader>
      )}

      {/* Details - Progress bars */}
      <CardContent className="space-y-4 p-0">
        {scores.map((score) => {
          const value = score.value;
          if (value === null || value === undefined) return null;

          return (
            <div key={score.key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{score.label}</span>
                <span className={cn("font-bold", getScoreColor(value))}>
                  {value.toFixed(1)}/10
                </span>
              </div>
              <Progress
                value={(value / 10) * 100}
                className="h-2"
                indicatorClassName={getProgressColor(value)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
