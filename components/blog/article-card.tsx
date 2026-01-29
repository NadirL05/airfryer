import Image from "next/image";
import Link from "next/link";
import { GUIDES } from "@/data/guides";

/** Fallback when article has no image (allowed in next.config) */
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1585307518179-e6c30c1f0dcc?auto=format&fit=crop&q=80&w=800";

interface ArticleCardProps {
  article: {
    title: string;
    slug: string;
    main_image_url: string | null;
    category: string | null;
    excerpt: string | null;
    created_at: string | null;
  };
}

/** Use /guide only when slug is a static guide (data/guides.ts); otherwise /blog (DB articles) */
function getArticleHref(slug: string, category: string | null): string {
  if (slug in GUIDES) return `/guide/${slug}`;
  return `/blog/${slug}`;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { title, slug, main_image_url, category, excerpt, created_at } = article;
  const href = getArticleHref(slug, category);

  const formattedDate =
    created_at &&
    new Date(created_at).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
      {/* Image */}
      <Link
        href={href}
        className="relative block w-full overflow-hidden bg-muted aspect-video"
      >
        <Image
          src={main_image_url || PLACEHOLDER_IMAGE}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p2 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          {category && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
              {category}
            </span>
          )}
          {formattedDate && (
            <time dateTime={created_at!}>{formattedDate}</time>
          )}
        </div>

        <Link href={href} className="mb-2 block">
          <h2 className="line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary sm:text-base">
            {title}
          </h2>
        </Link>

        {excerpt && (
          <p className="mb-4 line-clamp-3 text-xs text-muted-foreground sm:text-sm">
            {excerpt}
          </p>
        )}

        <div className="mt-auto">
          <Link
            href={href}
            className="text-xs font-medium text-primary hover:underline"
          >
            Lire l&apos;article
          </Link>
        </div>
      </div>
    </article>
  );
}

