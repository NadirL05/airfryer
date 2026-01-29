import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["br", "p", "strong", "em", "a", "ul", "ol", "li", "h2", "h3"];
const ALLOWED_ATTR = ["href", "target", "rel", "id"];

/**
 * Sanitize HTML before rendering with dangerouslySetInnerHTML.
 * Use for product descriptions, article content, or any stored HTML.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
