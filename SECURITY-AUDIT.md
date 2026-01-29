# Audit de sécurité statique — AirFryerDeal

**Date :** 27 janvier 2026  
**Stack :** Next.js 16 (App Router), Supabase, Tailwind, Vercel

---

## Tableau de synthèse

| Niveau | Fichier | Problème | Code corrigé (snippet) |
|--------|---------|----------|------------------------|
| 🔴 | `app/product/[slug]/page.tsx` | **XSS** : `product.description` rendu avec `dangerouslySetInnerHTML` après uniquement `.replace(/\n/g, "<br />")`. Aucune sanitization — du HTML malveillant en base s’exécute dans le navigateur. | Voir section « XSS – Product description » ci‑dessous. |
| 🔴 | Supabase (tables `products`, `articles`, `brands`) | **RLS absent** : Aucune politique RLS dans les migrations. En projet public, l’anon key peut permettre des écritures non désirées selon la config Supabase. | Appliquer `supabase/migrations/007_rls_policies.sql` (voir section RLS). |
| 🟠 | `app/blog/[slug]/page.tsx` | **Risque XSS futur** : Le contenu est affiché en texte brut (`{article.content}`). Si vous passez plus tard au rendu HTML (ex. `dangerouslySetInnerHTML`), il faudra **obligatoirement** sanitizer (ex. DOMPurify) avant affichage. | Si vous ajoutez du HTML : utiliser le même pattern que pour la correction produit (DOMPurify + `ALLOWED_TAGS` restreint). |
| 🟡 | `next.config.ts` | **Images externes** : Seuls `images.unsplash.com` et `upload.wikimedia.org` sont autorisés. Toute image venant d’un autre domaine (ex. Supabase Storage, CDN) provoquera une erreur en prod. | Ajouter les hostnames réels utilisés (ex. votre bucket Supabase) dans `images.remotePatterns`. Voir snippet ci‑dessous. |
| 🟢 | Composants `"use client"` | **Pas de fuite de clé** : Les composants client (`command-menu.tsx`, `compare-page.tsx`, etc.) n’utilisent que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Aucune variable `SUPABASE_SERVICE_*` exposée côté client. | Aucune modification nécessaire. |
| 🟢 | `lib/supabase/server.ts` | **Bon usage** : Le client serveur utilise uniquement l’anon key et les variables `NEXT_PUBLIC_*`. Pas de service role côté serveur Next (scripts à part). | Aucune modification nécessaire. |

---

## 1. XSS — Product description (critique)

**Fichier :** `app/product/[slug]/page.tsx`

- Installer une librairie de sanitization (recommandé : `isomorphic-dompurify` pour SSR) :

```bash
npm install isomorphic-dompurify
```

- Créer un helper (ex. `lib/sanitize.ts`) :

```ts
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["br", "p", "strong", "em", "a", "ul", "ol", "li", "h2", "h3"];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
```

- Remplacer le bloc actuel :

```tsx
<div
  className="space-y-4 text-foreground leading-relaxed"
  dangerouslySetInnerHTML={{
    __html: product.description.replace(/\n/g, "<br />"),
  }}
/>
```

par :

```tsx
<div
  className="space-y-4 text-foreground leading-relaxed"
  dangerouslySetInnerHTML={{
    __html: sanitizeHtml(product.description.replace(/\n/g, "<br />")),
  }}
/>
```

(penser à importer `sanitizeHtml` depuis `@/lib/sanitize`).

---

## 2. RLS — Lecture publique, écriture Admin uniquement

**Fichier à appliquer :** `supabase/migrations/007_rls_policies.sql`

- Activer RLS sur `products`, `articles`, `brands`.
- Politiques **SELECT** pour tout le monde (anon + authentifié) pour la lecture.
- Politiques **INSERT / UPDATE / DELETE** uniquement pour le rôle `service_role` (backend / scripts), pas pour `anon` ni `authenticated`.

Le fichier `007_rls_policies.sql` est fourni dans le dépôt ; l’appliquer via le dashboard Supabase ou la CLI.

---

## 3. Next.js — Domaines d’images

**Fichier :** `next.config.ts`

Si vous utilisez d’autres domaines (Supabase Storage, CDN, etc.), les ajouter dans `remotePatterns` :

```ts
// Exemple : ajout d’un bucket Supabase
{
  protocol: "https",
  hostname: "VOTRE_PROJECT_REF.supabase.co",
  pathname: "/storage/v1/object/public/**",
}
```

Adapter `hostname` et `pathname` selon vos URLs réelles (ex. `main_image_url` des articles/produits).

---

## 4. Récapitulatif des actions

1. 🔴 **Critique** : Ajouter DOMPurify (ou équivalent) et sanitizer `product.description` avant `dangerouslySetInnerHTML` (voir section 1).
2. 🔴 **Critique** : Appliquer la migration RLS `007_rls_policies.sql` sur Supabase.
3. 🟠 **Important** : Si le blog passe au HTML, appliquer la même sanitization que pour les produits.
4. 🟡 **Config** : Compléter `next.config.ts` avec tous les hostnames d’images utilisés en prod.
