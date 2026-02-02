import sanitize from "sanitize-html";

const ALLOWED_TAGS = ["br", "p", "strong", "em", "a", "ul", "ol", "li", "h2", "h3", "img", "figure", "figcaption"];
const ALLOWED_ATTR = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  "*": ["id"],
};

/**
 * Sanitize HTML before rendering with dangerouslySetInnerHTML.
 * Uses sanitize-html which works well on Vercel serverless.
 */
export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
  });
}
