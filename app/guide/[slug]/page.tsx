import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { TableOfContents } from "@/components/guide/table-of-contents";
import { ProductRankingCard } from "@/components/guide/product-ranking-card";
import { GUIDES } from "@/data/guides";
import { sanitizeHtml } from "@/lib/sanitize";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES[slug];

  if (!guide) {
    return { title: "Guide introuvable" };
  }

  return {
    title: guide.title,
    description: guide.intro.slice(0, 160),
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = GUIDES[slug];

  if (!guide) {
    notFound();
  }

  return (
    <div className="container max-w-5xl py-8 lg:max-w-6xl lg:py-12">
      <div className="mb-8 space-y-3 text-center lg:mb-10 lg:text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Guide d&apos;achat
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {guide.title}
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground lg:mx-0 lg:text-base">
          {guide.intro}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Sidebar — Table of contents (desktop only) */}
        <div className="hidden lg:col-span-3 lg:block">
          <div className="lg:sticky lg:top-24">
            <TableOfContents items={guide.toc} />
          </div>
        </div>

        {/* Main content — sections: text (sanitized HTML) or product (ProductRankingCard) */}
        <div className="lg:col-span-9">
          <article className="prose prose-sm max-w-none dark:prose-invert sm:prose-base lg:prose-lg prose-headings:scroll-mt-24">
            {guide.sections.map((section, index) => {
              if (section.type === "text") {
                return (
                  <div
                    key={index}
                    className="prose-p:my-2"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(section.html),
                    }}
                  />
                );
              }
              return (
                <div key={index} className="my-6">
                  <ProductRankingCard {...section.product} />
                </div>
              );
            })}
          </article>
        </div>
      </div>
    </div>
  );
}
