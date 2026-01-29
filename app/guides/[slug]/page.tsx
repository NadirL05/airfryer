import { redirect } from "next/navigation";
import { GUIDES } from "@/data/guides";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * /guides/[slug] → redirect to /guide/[slug] if static guide, else /blog/[slug].
 * Fixes 404 when footer/hero links point to /guides/meilleur-air-fryer-double-bac etc.
 */
export default async function GuidesSlugPage({ params }: PageProps) {
  const { slug } = await params;

  if (GUIDES[slug]) {
    redirect(`/guide/${slug}`);
  }

  redirect(`/blog/${slug}`);
}
