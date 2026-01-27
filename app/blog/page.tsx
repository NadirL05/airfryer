import { createClient } from "@/lib/supabase/server";
import { ArticleCard } from "@/components/blog/article-card";

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
    .select(
      "id, title, slug, excerpt, main_image_url, category, created_at"
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const posts = (data || []) as Article[];

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <header className="mb-8 lg:mb-12 space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Guides &amp; Recettes Air Fryer
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
          Découvrez nos tests détaillés, guides d&apos;achat et recettes pour
          maîtriser votre air fryer au quotidien.
        </p>
      </header>

      {error && (
        <p className="text-sm text-destructive mb-6">
          Impossible de charger les articles pour le moment.
        </p>
      )}

      {posts.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          Aucun article publié pour le moment.
        </p>
      )}

      {posts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard
              key={post.id}
              article={{
                title: post.title,
                slug: post.slug,
                main_image_url: post.main_image_url,
                category: post.category,
                excerpt: post.excerpt,
                created_at: post.created_at,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

