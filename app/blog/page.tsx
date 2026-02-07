import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { proxyImageUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  main_image_url: string | null;
  category: string | null;
  created_at: string | null;
}

export default async function BlogIndexPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, main_image_url, category, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const posts = (data || []) as Article[];

  const displayDate = (post: Article) => {
    const date = post.created_at;
    if (!date) return null;
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container py-8 lg:py-12">
      <header className="mb-10 lg:mb-14 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Le Blog Airfryer &amp; Recettes
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Conseils, recettes et guides pour tirer le meilleur de votre air fryer.
        </p>
      </header>

      {error && (
        <p className="mb-6 text-sm text-destructive">
          Impossible de charger les articles pour le moment.
        </p>
      )}

      {posts.length === 0 && !error && (
        <p className="text-center text-muted-foreground">
          Aucun article publié pour le moment.
        </p>
      )}

      {posts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const dateStr = displayDate(post);
            return (
              <article
                key={post.id}
                className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative block w-full overflow-hidden bg-gradient-to-br from-orange-400 to-amber-600 aspect-video"
                >
                  {post.main_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={proxyImageUrl(post.main_image_url, 600)}
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-600"
                      aria-hidden
                    />
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  {dateStr && (
                    <time
                      dateTime={post.created_at ?? undefined}
                      className="mb-2 block text-xs text-muted-foreground"
                    >
                      {dateStr}
                    </time>
                  )}
                  <Link href={`/blog/${post.slug}`} className="mb-2 block">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Lire la suite
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
