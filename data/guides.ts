/**
 * Slugs des guides statiques (redirect /guides/[slug] → /guide/[slug]).
 * Les guides dynamiques (DB) ne sont pas listés ici ; ils passent par /blog/[slug].
 */
export const GUIDES: Record<string, true> = {};
