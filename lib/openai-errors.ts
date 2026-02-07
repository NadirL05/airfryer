import OpenAI from "openai";

export function getOpenAIErrorMessage(error: unknown): string {
  if (error instanceof OpenAI.APIError) {
    const code = error.code ?? error.status;
    if (code === 401) return "Clé API OpenAI invalide ou manquante. Vérifiez OPENAI_API_KEY dans .env.local.";
    if (code === 429) return "Quota ou limite de requêtes dépassée. Réessayez plus tard.";
    if (code === 500 || code === 502 || code === 503) return "Service OpenAI temporairement indisponible.";
    return error.message || "Erreur API OpenAI.";
  }
  if (error instanceof Error) return error.message;
  return "Erreur inconnue.";
}
