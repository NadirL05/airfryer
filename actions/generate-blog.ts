"use server";

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Tu es un expert culinaire et SEO spécialisé dans les Airfryers. Rédige un article de blog en HTML (sans balises <html> ou <body>, juste le contenu) sur le sujet donné. Structure :
- Un Titre H1 accrocheur.
- Une intro qui donne envie.
- Des H2 pour les sections.
- Une section 'Ingrédients' (si c'est une recette).
- Une section 'Préparation' détaillée.
- Une conclusion qui incite à voir les 'Meilleurs Airfryers' du site.

Ton : Enthousiaste, expert, tutoiement ou vouvoiement léger.
Langue : Français.`;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface GenerateBlogPostResult {
  title: string;
  content: string;
  slug: string;
  meta_description: string;
}

export async function generateBlogPost(
  topic: string
): Promise<GenerateBlogPostResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY manquant. Ajoutez-la dans .env.local pour générer des articles."
    );
  }

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Sujet de l'article : ${topic}\n\nGénère le HTML du contenu uniquement (pas de balises \`\`\`html). À la toute fin de ta réponse, ajoute exactement une ligne : TITLE:|Le titre H1 de l'article| META:|Meta description SEO max 160 caractères|`,
      },
    ],
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("Réponse vide de l'IA.");
  }

  // Extraire TITLE et META depuis la fin du message si présents
  let content = raw;
  let title = topic;
  let meta_description =
    `Découvrez notre article "${topic}" : conseils et recettes pour votre air fryer.`;

  const titleMatch = raw.match(/TITLE:\|([^|]+)\|/);
  const metaMatch = raw.match(/META:\|([^|]+)\|/);
  if (titleMatch) {
    title = titleMatch[1].trim();
    content = content.replace(/TITLE:\|[^|]+\|?\s*/g, "").trim();
  }
  if (metaMatch) {
    meta_description = metaMatch[1].trim().slice(0, 160);
    content = content.replace(/META:\|[^|]+\|?\s*/g, "").trim();
  }

  // Nettoyer d'éventuels blocs markdown autour du HTML
  content = content.replace(/^```html?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  // Fallback : extraire le premier <h1> du contenu pour le titre
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match && title === topic) {
    title = h1Match[1].replace(/&nbsp;/g, " ").trim();
  }

  const slug = slugify(title);

  return { title, content, slug, meta_description };
}

export interface PublishArticleInput {
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  excerpt?: string | null;
}

export type PublishArticleResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function publishArticle(
  input: PublishArticleInput
): Promise<PublishArticleResult> {
  try {
    const supabase = await createClient();
    const excerpt =
      input.excerpt?.trim() ||
      input.meta_description.slice(0, 160) ||
      input.title;

    const { data, error } = await supabase
      .from("articles")
      .insert({
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt,
        meta_title: input.title,
        meta_description: input.meta_description,
        is_published: true,
        category: "recette",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Publish article error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("Publish article exception:", err);
    return { success: false, error: message };
  }
}
