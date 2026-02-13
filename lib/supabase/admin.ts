import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis."
    );
  }
  return createClient(url, key);
}

export interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  main_image_url: string | null;
  is_published: boolean;
  created_at: string | null;
}

export async function getAdminArticles(): Promise<AdminArticle[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, main_image_url, is_published, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminArticles error:", error);
    return [];
  }
  return (data || []) as AdminArticle[];
}
