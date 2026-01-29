"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/hooks/use-compare-store";
import { Swords, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompareFloatingBar() {
  const router = useRouter();
  const selectedIds = useCompareStore((s) => s.selectedIds);
  const clearSelection = useCompareStore((s) => s.clearSelection);

  const n = selectedIds.length;
  if (n === 0) return null;

  const handleLaunchDuel = () => {
    if (selectedIds.length !== 2) return;
    router.push(`/compare/versus?vs=${selectedIds[0]},${selectedIds[1]}`);
  };

  return (
    <div
      className={cn(
        "glass fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-slate-200/80 px-4 py-3 shadow-lg dark:border-slate-800",
        "min-w-[280px] sm:min-w-0 sm:px-6"
      )}
    >
      <p className="text-sm font-medium text-foreground">
        {n === 1
          ? "1 produit sélectionné"
          : `${n} produits sélectionnés`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-4 w-4" />
          Effacer
        </Button>
        <Button
          size="sm"
          onClick={handleLaunchDuel}
          disabled={n !== 2}
          className="gap-1.5"
        >
          <Swords className="h-4 w-4" />
          Lancer le Duel
        </Button>
      </div>
    </div>
  );
}
