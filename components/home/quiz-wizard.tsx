"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizProduct } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

// ============================================
// Types – Steps & Answers
// ============================================

type CapacityChoice = "solo" | "family" | "tribe";
type BudgetChoice = "petit" | "moyen" | "premium";
type FeatureChoice = "window" | "dual_zone" | "compact" | "app";

interface QuizAnswers {
  capacity: CapacityChoice | null;
  budget: BudgetChoice | null;
  feature: FeatureChoice | null;
}

const STEPS = [
  {
    id: 0,
    question: "Pour combien de personnes ?",
    key: "capacity" as const,
    options: [
      { value: "solo" as const, label: "Solo / Duo (1-2)", sub: "< 4,5 L" },
      { value: "family" as const, label: "Famille (3-5)", sub: "4,5 L – 7 L" },
      { value: "tribe" as const, label: "Tribu / XXL (6+)", sub: "> 7 L" },
    ],
  },
  {
    id: 1,
    question: "Quel est votre budget cible ?",
    key: "budget" as const,
    options: [
      { value: "petit" as const, label: "Petit budget", sub: "< 80 €" },
      { value: "moyen" as const, label: "Moyen", sub: "80 – 160 €" },
      { value: "premium" as const, label: "Premium", sub: "160 €+" },
    ],
  },
  {
    id: 2,
    question: "Le petit plus indispensable ?",
    key: "feature" as const,
    options: [
      { value: "window" as const, label: "Fenêtre de cuisson" },
      { value: "dual_zone" as const, label: "Double bac" },
      { value: "compact" as const, label: "Gain de place" },
      { value: "app" as const, label: "Connecté / App" },
    ],
  },
];

// ============================================
// Scoring
// ============================================

function capacityMatch(choice: CapacityChoice, capacityLiters: number | null): boolean {
  if (capacityLiters == null) return false;
  if (choice === "solo") return capacityLiters < 4.5;
  if (choice === "family") return capacityLiters >= 4.5 && capacityLiters <= 7;
  if (choice === "tribe") return capacityLiters > 7;
  return false;
}

function budgetMatch(choice: BudgetChoice, price: number): boolean {
  if (choice === "petit") return price <= 80;
  if (choice === "moyen") return price >= 80 && price <= 160;
  if (choice === "premium") return price >= 160;
  return false;
}

function featureMatch(choice: FeatureChoice, product: QuizProduct): boolean {
  if (choice === "window") return Boolean(product.has_window);
  if (choice === "dual_zone") return product.has_dual_zone;
  if (choice === "compact") return product.type === "compact";
  if (choice === "app") return product.has_app;
  return false;
}

function scoreProduct(product: QuizProduct, answers: QuizAnswers): number {
  let score = 0;
  if (answers.capacity && capacityMatch(answers.capacity, product.capacityLiters)) score += 3;
  if (answers.budget && budgetMatch(answers.budget, product.price)) score += 3;
  if (answers.feature && featureMatch(answers.feature, product)) score += 5;
  return score;
}

// ============================================
// Component
// ============================================

interface QuizWizardProps {
  products: QuizProduct[];
}

export function QuizWizard({ products }: QuizWizardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    capacity: null,
    budget: null,
    feature: null,
  });

  const isResultStep = step === 3;
  const currentStepConfig = STEPS[step];

  const handleChoice = (key: keyof QuizAnswers, value: CapacityChoice | BudgetChoice | FeatureChoice) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (step < 2) setStep((s) => s + 1);
    else setStep(3);
  };

  const restart = () => {
    setStep(0);
    setAnswers({ capacity: null, budget: null, feature: null });
  };

  const ranked = useMemo(() => {
    if (!isResultStep) return [];
    const withScores = products.map((p) => ({
      product: p,
      score: scoreProduct(p, answers),
    }));
    return withScores
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [products, answers, isResultStep]);

  const winner = ranked[0]?.product ?? null;
  const alternative = ranked[1]?.product ?? null;

  return (
    <section className="py-12 md:py-16" aria-label="Quiz de recommandation Air Fryer">
      <div className="container">
        <div className="glass mx-auto max-w-2xl rounded-2xl border border-slate-200/80 p-6 shadow-xl dark:border-slate-800 sm:p-8">
          <AnimatePresence mode="wait">
            {!isResultStep && currentStepConfig && (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Étape {step + 1} / 3</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {currentStepConfig.question}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-1">
                  {currentStepConfig.options.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onClick={() =>
                          handleChoice(
                            currentStepConfig.key,
                            opt.value as CapacityChoice | BudgetChoice | FeatureChoice
                          )
                        }
                        className={cn(
                          "flex w-full flex-col items-start rounded-xl border-2 border-slate-200 bg-background/80 px-5 py-4 text-left transition-all hover:border-primary hover:bg-primary/5 dark:border-slate-800 dark:hover:border-primary dark:hover:bg-primary/10",
                          "min-h-[56px] touch-manipulation"
                        )}
                      >
                        <span className="font-medium text-foreground">{opt.label}</span>
                        {"sub" in opt && opt.sub && (
                          <span className="mt-0.5 text-sm text-muted-foreground">{opt.sub}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {isResultStep && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Votre recommandation
                </h2>

                {winner ? (
                  <>
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                        <Trophy className="h-4 w-4" />
                        Le Vainqueur
                      </div>
                      <Link
                        href={`/product/${winner.slug}`}
                        className="block overflow-hidden rounded-xl border border-slate-200 bg-card transition-shadow hover:shadow-lg dark:border-slate-800"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative aspect-square w-full shrink-0 bg-muted sm:w-48">
                            <Image
                              src={winner.image_url ?? ""}
                              alt={winner.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 12rem"
                              unoptimized
                            />
                          </div>
                          <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
                            <h3 className="font-bold tracking-tight">{winner.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {winner.capacityLiters != null && `${winner.capacityLiters} L`}
                              {winner.capacityLiters != null && " · "}
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                                minimumFractionDigits: 0,
                              }).format(winner.price)}
                            </p>
                            <span className="mt-2 inline-flex text-sm font-medium text-primary">
                              Voir la fiche →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>

                    {alternative && (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Award className="h-4 w-4" />
                          L&apos;Alternative
                        </div>
                        <Link
                          href={`/product/${alternative.slug}`}
                          className="block overflow-hidden rounded-xl border border-slate-200 bg-card transition-shadow hover:shadow-md dark:border-slate-800"
                        >
                          <div className="flex flex-col sm:flex-row">
                            <div className="relative aspect-square w-full shrink-0 bg-muted sm:w-40">
                              <Image
                                src={alternative.image_url ?? ""}
                                alt={alternative.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, 10rem"
                                unoptimized
                              />
                            </div>
                            <div className="flex flex-1 flex-col justify-center p-3 sm:p-4">
                              <h3 className="font-medium tracking-tight">{alternative.title}</h3>
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {alternative.capacityLiters != null && `${alternative.capacityLiters} L`}
                                {alternative.capacityLiters != null && " · "}
                                {new Intl.NumberFormat("fr-FR", {
                                  style: "currency",
                                  currency: "EUR",
                                  minimumFractionDigits: 0,
                                }).format(alternative.price)}
                              </p>
                              <span className="mt-1 inline-flex text-sm font-medium text-primary">
                                Voir la fiche →
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Aucun produit ne correspond exactement à vos critères. Essayez d&apos;élargir vos choix ou{" "}
                    <Link href="/categorie/family" className="font-medium text-primary underline">
                      parcourir les catégories
                    </Link>
                    .
                  </p>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2 sm:w-auto"
                  onClick={restart}
                >
                  <RotateCcw className="h-4 w-4" />
                  Recommencer
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
