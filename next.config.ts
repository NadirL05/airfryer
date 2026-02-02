import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/produit/:path*", destination: "/product/:path*", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      // Banques d'images & Amazon
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Marques d'Air Fryer
      { protocol: "https", hostname: "images.philips.com" },
      { protocol: "https", hostname: "*.sharkninja.com" }, // Ninja (static.sharkninja.com, etc.)
      { protocol: "https", hostname: "ninja-kitchen.fr" },
      { protocol: "https", hostname: "cdn.shopify.com" }, // Cosori / Instant Pot
      { protocol: "https", hostname: "dam.groupeseb.com" }, // Moulinex / Tefal / Seb
      // Revendeurs Tech
      { protocol: "https", hostname: "boulanger.scene7.com" },
      { protocol: "https", hostname: "image.darty.com" },
      { protocol: "https", hostname: "static.fnac-static.com" },
      { protocol: "https", hostname: "contents.mediadecathlon.com" },
    ],
  },
};

export default nextConfig;
