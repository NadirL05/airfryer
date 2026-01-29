import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AirFryer Deal | Guide d'achat Air Fryers 2024",
    template: "%s | AirFryer Deal",
  },
  description:
    "Trouvez le meilleur air fryer pour vos besoins. Tests complets, comparatifs détaillés et avis d'experts. Ninja, Philips, Cosori, Tefal...",
  keywords: [
    "air fryer",
    "friteuse sans huile",
    "comparatif air fryer",
    "test air fryer",
    "meilleur air fryer",
    "ninja air fryer",
    "philips air fryer",
    "cosori",
    "tefal actifry",
  ],
  authors: [{ name: "AirFryer Deal" }],
  creator: "AirFryer Deal",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://airfryerdeal.com",
    siteName: "AirFryer Deal",
    title: "AirFryer Deal | Guide d'achat Air Fryers 2024",
    description:
      "Trouvez le meilleur air fryer pour vos besoins. Tests complets, comparatifs et avis d'experts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AirFryer Deal | Guide d'achat Air Fryers",
    description: "Trouvez le meilleur air fryer pour vos besoins.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
