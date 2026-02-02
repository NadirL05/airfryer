import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const isVercel = process.env.VERCEL === "1";
    const envHint = isVercel
      ? "Vercel Dashboard → Settings → Environment Variables"
      : "fichier .env.local";

    throw new Error(
      `Variables d'environnement Supabase manquantes. ` +
        `Vérifiez que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY ` +
        `sont définies dans votre ${envHint}. ` +
        `Consultez VERCEL-SETUP.md pour plus d'informations.`
    );
  }

  return { supabaseUrl, supabaseKey };
}

/**
 * Client Supabase sans accès aux cookies.
 * À utiliser uniquement dans les fonctions passées à unstable_cache()
 * (getBrandsUncached, getFeaturedProductsUncached, etc.) car cookies()
 * ne doit pas être appelé dans un scope de cache.
 */
export function createClientForCache() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No-op : pas de cookies dans un contexte caché
      },
    },
  });
}

export async function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
