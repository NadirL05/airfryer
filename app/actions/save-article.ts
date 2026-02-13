"use server";

import { marked } from "marked";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface SaveArticleInput {
  title: string;
  slug?: string | null;
  content: string;
  meta_description: string;
  excerpt?: string | null;
  /** URL de l'image de couverture (ex. générée par DALL-E, uploadée dans blog-images) */
  main_image_url?: string | null;
  /** Si true, l'article est publié immédiatement (is_published: true, published_at). Sinon brouillon. */
  shouldPublish?: boolean;
}

export type SaveArticleResult =
  | { success: true; id: string; slug: string }
  | { success: false; error: string };

/**
 * Enregistre l'article dans Supabase (table articles).
 * Le contenu peut être en Markdown : il est converti en HTML avant insertion.
 * Si slug est vide, il est généré à partir du titre.
 */
export async function saveArticle(
  articleData: SaveArticleInput
): Promise<SaveArticleResult> {
  try {
    const slug =
      articleData.slug?.trim() || slugify(articleData.title.trim());
    if (!slug) {
      return { success: false, error: "Impossible de générer un slug (titre vide)." };
    }

    const excerpt =
      articleData.excerpt?.trim() ||
      articleData.meta_description.slice(0, 160) ||
      articleData.title;

    // Contenu : si ça ressemble à du Markdown, convertir en HTML
    let htmlContent = articleData.content.trim();
    if (
      htmlContent.includes("##") ||
      htmlContent.includes("**") ||
      htmlContent.includes("- ") ||
      htmlContent.includes("\n\n")
    ) {
      htmlContent = marked.parse(htmlContent, { async: false }) as string;
    }

    const shouldPublish = Boolean(articleData.shouldPublish);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("articles")
      .insert({
        title: articleData.title.trim(),
        slug,
        content: htmlContent,
        excerpt,
        meta_title: articleData.title.trim(),
        meta_description: articleData.meta_description.trim().slice(0, 160),
        is_published: shouldPublish,
        ...(shouldPublish && { published_at: new Date().toISOString() }),
        main_image_url: articleData.main_image_url?.trim() || null,
        category: "recette",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Save article error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data.id, slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("Save article exception:", err);
    return { success: false, error: message };
  }
}
