"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import {
  Home,
  BookOpen,
  Building2,
  Package,
  Search,
  Loader2,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

// ============================================
// Types
// ============================================

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  main_image_url: string | null;
  price: number;
  brand_name: string | null;
  category_slug: string | null;
}

interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ============================================
// Navigation Links
// ============================================

const NAVIGATION_LINKS = [
  {
    label: "Accueil",
    href: "/",
    icon: Home,
  },
  {
    label: "Guides & Conseils",
    href: "/guides",
    icon: BookOpen,
  },
  {
    label: "Toutes les Marques",
    href: "/marques",
    icon: Building2,
  },
  {
    label: "Tous les Produits",
    href: "/produits",
    icon: Package,
  },
] as const;

// ============================================
// Supabase Client (singleton for client-side)
// ============================================

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      supabaseClient = createClient(url, key);
    }
  }
  return supabaseClient;
}

// ============================================
// Custom Hook: useCommandMenu
// ============================================

export function useCommandMenu() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, setOpen };
}

// ============================================
// Component: CommandMenu
// ============================================

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Debounced search
  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setIsLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const { data, error } = await (supabase as any).rpc(
          "search_products",
          {
            query_text: query,
            max_results: 5,
          }
        );

        if (error) {
          console.error("Search error:", error);
          setResults([]);
        } else {
          setResults(data || []);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [open]);

  // Handle product selection
  const handleSelectProduct = (slug: string) => {
    router.push(`/product/${slug}`);
    onOpenChange?.(false);
  };

  // Handle navigation selection
  const handleSelectNavigation = (href: string) => {
    router.push(href);
    onOpenChange?.(false);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Rechercher un produit, une marque..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Recherche en cours...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && hasSearched && results.length === 0 && query.length >= 2 && (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4">
              <Search className="h-8 w-8 text-muted-foreground/50" />
              <p>Aucun résultat pour &quot;{query}&quot;</p>
              <p className="text-xs text-muted-foreground">
                Essayez un autre terme de recherche
              </p>
            </div>
          </CommandEmpty>
        )}

        {/* Product Results */}
        {!isLoading && results.length > 0 && (
          <CommandGroup heading="Produits">
            {results.map((product) => (
              <CommandItem
                key={product.id}
                value={`${product.title} ${product.brand_name || ""}`}
                onSelect={() => handleSelectProduct(product.slug)}
                className="flex items-center gap-3 py-3"
              >
                {/* Thumbnail */}
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {product.main_image_url ? (
                    <Image
                      src={product.main_image_url}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  <span className="truncate font-medium">{product.title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {product.brand_name || "Marque inconnue"}
                    {product.category_slug && ` • ${product.category_slug}`}
                  </span>
                </div>

                {/* Price */}
                <span className="shrink-0 text-sm font-semibold text-primary">
                  {formatPrice(product.price)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Separator */}
        {!isLoading && (results.length > 0 || !hasSearched) && (
          <CommandSeparator />
        )}

        {/* Navigation Links */}
        <CommandGroup heading="Navigation">
          {NAVIGATION_LINKS.map((link) => (
            <CommandItem
              key={link.href}
              value={link.label}
              onSelect={() => handleSelectNavigation(link.href)}
              className="flex items-center gap-3"
            >
              <link.icon className="h-4 w-4 text-muted-foreground" />
              <span>{link.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Keyboard Shortcut Hint */}
        <div className="border-t px-3 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Raccourci clavier</span>
            <CommandShortcut>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </CommandShortcut>
          </div>
        </div>
      </CommandList>
    </CommandDialog>
  );
}

// ============================================
// Component: CommandMenuTrigger (for Header)
// ============================================

interface CommandMenuTriggerProps {
  onClick?: () => void;
  className?: string;
}

export function CommandMenuTrigger({
  onClick,
  className,
}: CommandMenuTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${className || ""}`}
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline-block">Rechercher...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}

// ============================================
// Component: CommandMenuProvider (combines state + UI)
// ============================================

export function CommandMenuProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { open, setOpen } = useCommandMenu();

  return (
    <>
      {children}
      <CommandMenu open={open} onOpenChange={setOpen} />
    </>
  );
}
