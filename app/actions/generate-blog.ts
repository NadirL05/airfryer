"use server";

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIErrorMessage } from "@/lib/openai-errors";

const SYSTEM_PROMPT = `Tu es un expert culinaire et rédacteur SEO spécialisé dans les Airfryers. Rédige un article de blog structuré en Markdown. Ton style doit être : expert, engageant, et optimisé pour le référencement (SEO). Structure JSON attendue : { "title": "Un titre H1 accrocheur et optimisé SEO (sans le préfixe H1)", "slug": "un-slug-url-friendly-basé-sur-le-titre", "meta_description": "Une méta description engageante de moins de 160 caractères", "content": "Le contenu complet de l'article en Markdown (avec des H2, listes à puces, gras pour les mots clés, etc.). Ne mets pas le titre H1 ici." }`;

const BUCKET = "blog-images";

export interface GenerateBlogPostResult {
  title: string;
  content: string;
  slug: string;
  meta_description: string;
  image_url: string | null;
}

export type GenerateBlogPostResponse =
  | { success: true; data: GenerateBlogPostResult }
  | { success: false; error: string };

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function generateBlogPost(topic: string): Promise<GenerateBlogPostResponse> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "OPENAI_API_KEY manquant. Ajoutez-la dans .env.local." };
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Sujet ou titre de l'article / recette : ${topic}` },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return { success: false, error: "Réponse vide de l'IA." };
    }

    let parsed: { title?: string; content?: string; meta_description?: string; slug?: string };
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      return { success: false, error: "L'IA n'a pas renvoyé un JSON valide." };
    }

    const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : topic;
    const content = typeof parsed.content === "string" && parsed.content.trim() ? parsed.content.trim() : "";
    const meta_description = typeof parsed.meta_description === "string" && parsed.meta_description.trim()
      ? parsed.meta_description.trim().slice(0, 160)
      : `Découvrez notre article "${title}" : conseils et recettes pour votre air fryer.`;
    const slug = typeof parsed.slug === "string" && parsed.slug.trim() ? slugify(parsed.slug.trim()) : slugify(title);

    if (!content) {
      return { success: false, error: "Le contenu généré est vide." };
    }

    let image_url: string | null = null;
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Une photo culinaire professionnelle et réaliste pour illustrer cet article : "${title}". Éclairage cinématique, haute résolution, appétissant.`,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      const imageUrl = imageResponse.data[0]?.url;
      if (!imageUrl) throw new Error("Aucune URL d'image retournée par DALL-E.");

      const imageRes = await fetch(imageUrl);
      if (!imageRes.ok) throw new Error(`Échec du téléchargement de l'image: ${imageRes.status}`);
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `${slug}-${Date.now()}.png`;
      const supabase = await createClient();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, buffer, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload blog image error:", uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    } catch (imageError) {
      console.error("Generate/upload cover image failed:", imageError);
      image_url = null;
    }

    return { success: true, data: { title, content, slug, meta_description, image_url } };
  } catch (error) {
    return { success: false, error: getOpenAIErrorMessage(error) };
  }
}
