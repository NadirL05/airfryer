import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  Users,
  Maximize2,
  Flame,
  Wind,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickFinderCard {
  name: string;
  slug: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  count: string;
  gradient: string;
}

const finderCategories: QuickFinderCard[] = [
  {
    name: "Compacts",
    slug: "compact",
    description: "2-3L",
    icon: Zap,
    count: "24 modèles",
    gradient: "from-blue-500/10 to-blue-600/5",
  },
  {
    name: "Familiaux",
    slug: "family",
    description: "4-5L",
    icon: Users,
    count: "42 modèles",
    gradient: "from-primary/10 to-primary/5",
  },
  {
    name: "XXL",
    slug: "xxl",
    description: "6-8L",
    icon: Maximize2,
    count: "18 modèles",
    gradient: "from-secondary/10 to-secondary/5",
  },
  {
    name: "Fours",
    slug: "oven",
    description: "Multifonction",
    icon: Flame,
    count: "15 modèles",
    gradient: "from-orange-500/10 to-orange-600/5",
  },
  {
    name: "Déshydrateurs",
    slug: "dehydrator",
    description: "Fruits & légumes",
    icon: Wind,
    count: "12 modèles",
    gradient: "from-green-500/10 to-green-600/5",
  },
];

export function QuickFinder() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Votre air fryer par{" "}
            <span className="text-primary">format</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement le modèle adapté à votre foyer et vos besoins
            de cuisson
          </p>
        </div>

        {/* Grid of Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {finderCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className="group"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    {/* Icon Container with Gradient Background */}
                    <div
                      className={cn(
                        "relative rounded-2xl p-4 bg-gradient-to-br",
                        category.gradient,
                        "group-hover:scale-110 transition-transform duration-300"
                      )}
                    >
                      <Icon className="h-8 w-8 text-primary" />
                    </div>

                    {/* Name and Description */}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>

                    {/* Model Count */}
                    <p className="text-xs font-medium text-muted-foreground">
                      {category.count}
                    </p>

                    {/* Arrow Icon */}
                    <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">Découvrir</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
