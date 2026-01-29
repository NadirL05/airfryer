"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const TITLE = "Choisir son air fryer n'a jamais été aussi simple";
const WORDS = TITLE.split(" ");

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 * i },
  }),
};

const word = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function AnimatedHero() {
  return (
    <section className="hero-gradient relative overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-6 text-center lg:text-left">
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-display)]"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              {WORDS.map((w, i) => (
                <motion.span
                  key={i}
                  variants={word}
                  className="inline-block mr-[0.25em]"
                >
                  {w === "simple" ? (
                    <span className="text-primary">{w}</span>
                  ) : (
                    w
                  )}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              Tests complets, comparatifs détaillés et avis d&apos;experts pour
              trouver le meilleur air fryer adapté à vos besoins. Cuisinez
              sainement, croustillant et sans huile.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.65 },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <Button size="lg" className="text-base px-8 py-6" asChild>
                  <Link href="/categorie/family">
                    Les meilleurs air fryers
                  </Link>
                </Button>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
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
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Visual */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent blur-3xl" />
              <div className="relative h-full w-full rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg">
                <div className="relative z-10 rounded-full bg-primary/10 p-8">
                  <svg
                    className="h-24 w-24 text-primary sm:h-32 sm:w-32"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
