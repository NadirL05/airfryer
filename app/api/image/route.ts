import { NextRequest, NextResponse } from "next/server";

/** Domaines autorisés pour le proxy d'images (éviter les abus) */
const ALLOWED_DOMAINS = [
  "m.media-amazon.com",
  "images.philips.com",
  "upload.wikimedia.org",
  "images.unsplash.com",
  "blogger.googleusercontent.com",
  "static.sharkninja.com",
  "ninja-kitchen.fr",
  "cdn.shopify.com",
  "dam.groupeseb.com",
  "boulanger.scene7.com",
  "image.darty.com",
  "static.fnac-static.com",
  "contents.mediadecathlon.com",
  "electroguide.com",
  "encrypted-tbn0.gstatic.com",
  "www.leairfryer.fr",
  "leairfryer.fr",
  "www.ifa-berlin.com",
];

function isUrlAllowed(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    return ALLOWED_DOMAINS.some(
      (d) => u.hostname === d || u.hostname.endsWith("." + d)
    );
  } catch {
    return false;
  }
}

/**
 * GET /api/image?url=...&w=...
 * Proxie les images externes pour contourner les restrictions hotlinking (Amazon, etc.)
 */
export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "Paramètre url requis" }, { status: 400 });
  }

  let targetUrl: string;
  try {
    targetUrl = decodeURIComponent(urlParam);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  if (!isUrlAllowed(targetUrl)) {
    return NextResponse.json({ error: "Domaine non autorisé" }, { status: 403 });
  }

  try {
    const isAmazon = targetUrl.includes("media-amazon.com");
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/*",
        ...(isAmazon && { Referer: "https://www.amazon.fr/" }),
      },
      next: { revalidate: 86400 }, // Cache 24h
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Source: ${res.status}` },
        { status: res.status === 404 ? 404 : 502 }
      );
    }

    const contentType =
      res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("[api/image] Erreur fetch:", err);
    return NextResponse.json(
      { error: "Impossible de récupérer l'image" },
      { status: 502 }
    );
  }
}
