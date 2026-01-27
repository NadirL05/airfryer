import { redirect } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Map usage slugs to category mappings
const usageMappings: Record<string, { category?: string; title: string; description: string }> = {
  celibataire: {
    category: "compact",
    title: "Pour célibataire",
    description: "Les meilleurs air fryers compacts pour une personne",
  },
  couple: {
    category: "family",
    title: "Pour couple",
    description: "Air fryers familiaux idéaux pour deux personnes",
  },
  famille: {
    category: "xxl",
    title: "Pour famille",
    description: "Grands air fryers pour les familles nombreuses",
  },
  sante: {
    title: "Pour cuisiner sain",
    description: "Air fryers pour une cuisine saine et équilibrée",
  },
  frites: {
    title: "Pour frites parfaites",
    description: "Les meilleurs air fryers pour des frites croustillantes",
  },
  poulet: {
    title: "Pour poulet rôti",
    description: "Air fryers pour cuire un poulet entier",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const usage = usageMappings[slug];

  if (!usage) {
    return {
      title: "Usage non trouvé | AirFryer Deal",
    };
  }

  const title = `${usage.title} - Air Fryers Recommandés 2026 | AirFryer Deal`;
  const description = usage.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function UsagePage({ params }: PageProps) {
  const { slug } = await params;
  const usage = usageMappings[slug];

  if (!usage) {
    redirect("/");
  }

  // Redirect to category page if category exists, otherwise to home
  if (usage.category) {
    redirect(`/${usage.category}`);
  } else {
    redirect("/");
  }
}
