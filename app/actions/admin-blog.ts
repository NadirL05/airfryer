"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ToggleResult = { success: true } | { success: false; error: string };
export type DeleteResult = { success: true } | { success: false; error: string };

/**
 * Inverse le statut is_published de l'article (brouillon ↔ en ligne).
 */
export async function toggleArticleStatus(
  id: string,
  currentStatus: boolean
): Promise<ToggleResult> {
  try {
    const supabase = getSupabaseAdmin();
    const nextStatus = !currentStatus;
    const update: Record<string, unknown> = { is_published: nextStatus };
    if (nextStatus) {
      update.published_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from("articles")
      .update(update)
      .eq("id", id);

    if (error) {
      console.error("toggleArticleStatus error:", error);
      return { success: false, error: error.message };
    }
    revalidatePath("/blog");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("toggleArticleStatus exception:", err);
    return { success: false, error: message };
  }
}

/**
 * Supprime l'article. Tente de supprimer l'image dans le bucket blog-images si l'URL est un Storage Supabase.
 */
export async function deleteArticle(id: string): Promise<DeleteResult> {
  try {
    const supabase = getSupabaseAdmin();

    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("main_image_url")
      .eq("id", id)
      .single();

    if (!fetchError && article?.main_image_url) {
      const url = article.main_image_url as string;
      try {
        const match = url.match(/\/storage\/v1\/object\/public\/blog-images\/(.+?)(?:\?|$)/);
        if (match) {
          const filePath = decodeURIComponent(match[1]);
          await supabase.storage.from("blog-images").remove([filePath]);
        }
      } catch {
        // Ignorer l'échec de suppression de l'image
      }
    }

    const { error: deleteError } = await supabase.from("articles").delete().eq("id", id);

    if (deleteError) {
      console.error("deleteArticle error:", deleteError);
      return { success: false, error: deleteError.message };
    }
    revalidatePath("/blog");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("deleteArticle exception:", err);
    return { success: false, error: message };
  }
}
