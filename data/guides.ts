import type { TocItem } from "@/components/guide/table-of-contents";
import type { ProductRankingCardProps } from "@/components/guide/product-ranking-card";

/** Product data for a ranking card (no className) */
export type GuideProductData = Omit<ProductRankingCardProps, "className">;

/** A single guide section: either a text block (HTML) or a product block */
export type GuideSection =
  | { type: "text"; html: string }
  | { type: "product"; product: GuideProductData };

export interface Guide {
  /** H1 title for the guide */
  title: string;
  /** Intro paragraph (e.g. below the title) */
  intro: string;
  /** Table of contents entries */
  toc: TocItem[];
  /** Ordered mix of text (HTML) and product sections */
  sections: GuideSection[];
}

export const GUIDES: Record<string, Guide> = {
  "meilleur-air-fryer-double-bac": {
    title:
      "Les 3 Meilleurs Air Fryers Double Bac en 2026 : Le Comparatif Ultime",
    intro:
      "Deux zones indépendantes, deux plats en même temps : le double bac n'est plus un gadget, c'est le must-have pour les familles. Nous avons testé les modèles les plus vendus pour ne garder que ceux qui tiennent la route.",
    toc: [
      { id: "notre-top-3", text: "Notre Top 3", level: 2 },
      { id: "test-ninja", text: "Test Ninja", level: 3 },
      { id: "test-philips", text: "Test Philips", level: 3 },
      { id: "guide-achat", text: "Guide d'achat", level: 2 },
    ],
    sections: [
      {
        type: "text",
        html: `<h2 id="notre-top-3">Notre Top 3</h2>
<p>Deux zones, deux températures, zéro compromis : après des semaines de tests, deux modèles se détachent — le Ninja pour la polyvalence et la robustesse, le Philips pour la précision et les cuissons exigeantes.</p>`,
      },
      {
        type: "product",
        product: {
          bannerLabel: "Top Vente",
          bannerVariant: "blue",
          title: "Ninja Foodi Max Dual Zone (AF400EU)",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Ninja_Foodi_air_fryer.jpg/640px-Ninja_Foodi_air_fryer.jpg",
          rating: 4.8,
          features: ["9.5L", "2400W", "SyncFinish"],
          verdict:
            "Le roi incontesté de la double cuisson.",
          price: "269 €",
          affiliateUrl: "#",
          ctaLabel: "Voir promo Amazon",
          reviewUrl: "/product/ninja-foodi-max",
        },
      },
      {
        type: "text",
        html: `<h3 id="test-ninja">Test Ninja</h3>
<p>Le Ninja AF400EU impose sa loi : deux paniers de 4,7 L chacun, SyncFinish pour finir les deux plats en même temps, et une finition qui résiste aux chocs. Idéal pour un couple ou une petite famille qui enchaîne apéro et plat.</p>
<h3 id="test-philips">Test Philips</h3>
<p>Philips mise sur la précision : sonde thermique, rail télescopique, app NutriU. Plus cher, mais le choix logique si vous rôtissez souvent viande ou poisson.</p>`,
      },
      {
        type: "product",
        product: {
          bannerLabel: "Premium",
          bannerVariant: "gold",
          title: "Philips Airfryer Series 7000 XXL",
          imageUrl:
            "https://m.media-amazon.com/images/I/71Pb0kYKRqL._AC_SL1500_.jpg",
          rating: 4.6,
          features: ["Sonde", "Appli NutriU", "Rail"],
          verdict:
            "La précision absolue pour les gourmets.",
          price: "349 €",
          affiliateUrl: "#",
          ctaLabel: "Voir prix",
          reviewUrl: "/product/philips-combi-7000",
        },
      },
      {
        type: "text",
        html: `<h2 id="guide-achat">Guide d'achat</h2>
<p>Un bon air fryer double bac doit offrir au moins 8 L de capacité totale, des paniers vraiment indépendants (température et temps différents), et un revêtement qui passe au lave-vaisselle. Pensez à la place sur le plan de travail : certains modèles dépassent 40 cm de large.</p>
<p>Notre conseil : si vous hésitez entre un grand mono-bac et un double bac, le double bac gagne dès que vous préparez régulièrement deux choses en parallèle. Le gain de temps et la flexibilité justifient l'investissement.</p>`,
      },
    ],
  },
};
