import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["br", "p", "strong", "em", "a", "ul", "ol", "li", "h2", "h3"];
const ALLOWED_ATTR = ["href", "target", "rel", "id"];

/** Fallback when DOMPurify throws on server (e.g. Vercel) */
function stripHtmlFallback(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "");
}

/**
 * Sanitize HTML before rendering with dangerouslySetInnerHTML.
 * On error (e.g. Vercel server), falls back to stripping tags.
 */
export function sanitizeHtml(html: string): string {
  try {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  } catch {
    return stripHtmlFallback(html);
  }
}
