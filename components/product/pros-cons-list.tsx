import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProsConsListProps {
  pros: string[];
  cons: string[];
}

export function ProsConsList({ pros, cons }: ProsConsListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Points forts - Check vert */}
      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          Points forts
        </h3>
        {pros.length > 0 ? (
          <ul className="space-y-3">
            {pros.map((pro, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun point positif listé
          </p>
        )}
      </div>

      {/* Points faibles - Croix rouge */}
      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/80 dark:bg-red-950/50 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-red-700 dark:text-red-400">
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          Points faibles
        </h3>
        {cons.length > 0 ? (
          <ul className="space-y-3">
            {cons.map((con, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-foreground"
              >
                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun point négatif listé
          </p>
        )}
      </div>
    </div>
  );
}
