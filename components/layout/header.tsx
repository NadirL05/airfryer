"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { CommandMenu } from "@/components/layout/command-menu";
import { useScroll } from "@/hooks/use-scroll";
import {
  Search,
  Menu,
  ChevronRight,
  Zap,
  Users,
  Maximize2,
  Wind,
  Flame,
} from "lucide-react";

// Navigation Data
const brands = [
  { name: "Ninja", slug: "ninja", description: "Technologie Dual Zone innovante" },
  { name: "Philips", slug: "philips", description: "Pionnier de l'air fryer" },
  { name: "Cosori", slug: "cosori", description: "Excellent rapport qualité-prix" },
  { name: "Tefal", slug: "tefal", description: "Gamme ActiFry française" },
  { name: "Moulinex", slug: "moulinex", description: "Easy Fry accessible" },
  { name: "Xiaomi", slug: "xiaomi", description: "Connecté et abordable" },
];

const capacities = [
  { name: "Compact (< 3L)", slug: "compact", icon: Zap, description: "Pour 1-2 personnes" },
  { name: "Familial (3-5L)", slug: "family", icon: Users, description: "Pour 3-4 personnes" },
  { name: "XXL (> 5L)", slug: "xxl", icon: Maximize2, description: "Pour 5+ personnes" },
  { name: "Four Air Fryer", slug: "oven", icon: Flame, description: "Multifonction" },
  { name: "Déshydrateur", slug: "dehydrator", icon: Wind, description: "Fruits & légumes" },
];

const priceRanges = [
  { name: "Moins de 50€", slug: "moins-50", description: "Budget serré" },
  { name: "50€ - 100€", slug: "50-100", description: "Entrée de gamme" },
  { name: "100€ - 200€", slug: "100-200", description: "Milieu de gamme" },
  { name: "Plus de 200€", slug: "plus-200", description: "Haut de gamme" },
];

const usages = [
  { name: "Pour célibataire", slug: "celibataire", icon: "👤" },
  { name: "Pour couple", slug: "couple", icon: "👫" },
  { name: "Pour famille", slug: "famille", icon: "👨‍👩‍👧‍👦" },
  { name: "Pour cuisiner sain", slug: "sante", icon: "🥗" },
  { name: "Pour frites parfaites", slug: "frites", icon: "🍟" },
  { name: "Pour poulet rôti", slug: "poulet", icon: "🍗" },
];

export function Header() {
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const hasScrolled = useScroll(50);

  // Listen for Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
          hasScrolled
            ? "glass border-b border-slate-200/80 dark:border-slate-800"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div
          className={cn(
            "container flex items-center justify-between transition-[height] duration-300",
            hasScrolled ? "h-14" : "h-16"
          )}
        >
          {/* Logo */}
          <Logo showTagline />

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {/* Par Marque */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Par Marque</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {brands.map((brand) => (
                      <ListItem
                        key={brand.slug}
                        title={brand.name}
                        href={`/marque/${brand.slug}`}
                      >
                        {brand.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Par Capacité */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Par Capacité</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {capacities.map((capacity) => (
                      <ListItem
                        key={capacity.slug}
                        title={capacity.name}
                        href={`/categorie/${capacity.slug}`}
                        icon={capacity.icon}
                      >
                        {capacity.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Par Prix */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Par Prix</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[350px] gap-3 p-4">
                    {priceRanges.map((price) => (
                      <ListItem
                        key={price.slug}
                        title={price.name}
                        href={`/prix/${price.slug}`}
                      >
                        {price.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Par Usage */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Par Usage</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    {usages.map((usage) => (
                      <li key={usage.slug}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={`/usage/${usage.slug}`}
                            className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                          >
                            <span className="text-2xl">{usage.icon}</span>
                            <span className="font-medium">{usage.name}</span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Guides */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/guides">Guides</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search Trigger Button */}
            <Button
              variant="outline"
              onClick={() => setIsCommandOpen(true)}
              className="relative h-9 w-9 p-0 sm:h-9 sm:w-auto sm:px-3 sm:pr-12"
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline-flex text-sm text-muted-foreground">
                Rechercher un air fryer...
              </span>
              <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <div className="text-left">
                    <Logo variant="footer" />
                  </div>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-4">
                  {/* Mobile Search Button */}
                  <Button
                    variant="outline"
                    onClick={() => setIsCommandOpen(true)}
                    className="justify-start gap-2 text-muted-foreground"
                  >
                    <Search className="h-4 w-4" />
                    Rechercher...
                  </Button>

                  <MobileNavSection title="Par Marque" items={brands} basePath="/marque" />
                  <MobileNavSection
                    title="Par Capacité"
                    items={capacities.map((c) => ({
                      name: c.name,
                      slug: c.slug,
                      description: c.description,
                    }))}
                    basePath="/categorie"
                  />
                  <MobileNavSection title="Par Prix" items={priceRanges} basePath="/prix" />
                  <Link
                    href="/guides"
                    className="flex items-center justify-between rounded-lg bg-accent/50 px-4 py-3 font-medium"
                  >
                    Guides & Recettes
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Command Menu Dialog */}
      <CommandMenu open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </>
  );
}

// List Item Component for Navigation
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
  }
>(({ className, title, children, icon: Icon, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href || "#"}
          className={cn(
            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

// Mobile Navigation Section
function MobileNavSection({
  title,
  items,
  basePath,
}: {
  title: string;
  items: Array<{ name: string; slug: string; description?: string }>;
  basePath: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 font-semibold"
      >
        {title}
        <ChevronRight
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}
        />
      </button>
      {isOpen && (
        <div className="mt-2 flex flex-col gap-1 pl-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`${basePath}/${item.slug}`}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
