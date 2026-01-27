"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SORT_OPTIONS = [
  { label: "Meilleure note", value: "score_desc" },
  { label: "Prix croissant", value: "price_asc" },
  { label: "Prix décroissant", value: "price_desc" },
  { label: "Nouveautés", value: "newest" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as SortValue) || "score_desc";
  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === currentSort)?.label ||
    "Meilleure note";

  const handleSortChange = (value: SortValue) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "score_desc") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.push(newUrl, { scroll: false });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-sm"
        >
          <span className="text-muted-foreground">Trier par:</span>
          <span className="font-medium">{currentLabel}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className={
              currentSort === option.value
                ? "bg-accent font-medium"
                : "cursor-pointer"
            }
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
