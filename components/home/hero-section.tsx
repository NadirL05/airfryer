import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Choisir son air fryer n&apos;a jamais été aussi{" "}
              <span className="text-primary">simple</span>
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0">
              Tests complets, comparatifs détaillés et avis d&apos;experts pour
              trouver le meilleur air fryer adapté à vos besoins. Cuisinez
              sainement, croustillant et sans huile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="text-base px-8 py-6" asChild>
                <Link href="/categorie/family">
                  Les meilleurs air fryers
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6"
                asChild
              >
                <Link href="/guides/meilleur-air-fryer-double-bac">
                  Guide d&apos;achat
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative flex items-center justify-center">
            {/* Placeholder Image Container */}
            <div className="relative w-full max-w-md aspect-square">
              {/* Abstract Shape as Placeholder */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent blur-3xl" />
              
              {/* Main Visual Container */}
              <div className="relative h-full w-full rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 flex items-center justify-center">
                {/* Icon or Placeholder Image */}
                <div className="relative z-10">
                  <ChefHat className="h-32 w-32 text-primary/40 md:h-40 md:w-40" />
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 h-20 w-20 rounded-full bg-secondary/20 blur-xl" />
                <div className="absolute bottom-10 left-10 h-24 w-24 rounded-full bg-primary/20 blur-xl" />
              </div>

              {/* Optional: If you have an actual image, uncomment this */}
              {/* 
              <Image
                src="/images/air-fryer-hero.png"
                alt="Air Fryer"
                fill
                className="object-contain"
                priority
              />
              */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration (optional) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
