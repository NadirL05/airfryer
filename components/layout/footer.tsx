import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const footerLinks = {
  products: {
    marques: [
      { name: "Ninja", href: "/marque/ninja" },
      { name: "Philips", href: "/marque/philips" },
      { name: "Cosori", href: "/marque/cosori" },
      { name: "Tefal", href: "/marque/tefal" },
      { name: "Moulinex", href: "/marque/moulinex" },
      { name: "Xiaomi", href: "/marque/xiaomi" },
    ],
    categories: [
      { name: "Compacts", href: "/categorie/compact" },
      { name: "Familiaux", href: "/categorie/family" },
      { name: "XXL", href: "/categorie/xxl" },
      { name: "Fours Air Fryer", href: "/categorie/oven" },
    ],
  },
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Guides d'achat", href: "/guides" },
    { name: "Comment choisir", href: "/guides/meilleur-air-fryer-double-bac" },
    { name: "Comparateur", href: "/compare" },
    { name: "FAQ Air Fryers", href: "/faq" },
  ],
  legal: [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "Confidentialité", href: "/confidentialite" },
    { name: "À propos", href: "/a-propos" },
    { name: "Contact", href: "/contact" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
];

const footerTitleClass =
  "mb-4 text-sm font-semibold uppercase tracking-wider text-slate-100 font-[family-name:var(--font-display)]";

export function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-200">
      {/* Main Footer - 4 columns */}
      <div className="container py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Logo + Slogan + Réseaux sociaux */}
          <div className="space-y-4">
            <Logo variant="footer" className="text-white" />
            <p className="max-w-xs text-sm text-slate-400">
              Votre guide expert pour choisir le meilleur air fryer. Tests,
              comparatifs et avis d&apos;experts.
            </p>
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-700/80 bg-slate-800/50 p-2.5 text-slate-400 transition-colors hover:border-primary/50 hover:text-primary hover:bg-slate-800"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-800">
              <h4 className={footerTitleClass}>Newsletter</h4>
              <NewsletterForm />
            </div>
          </div>

          {/* Col 2: Produits (Marques + Catégories) */}
          <div>
            <h3 className={footerTitleClass}>Produits</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Marques
                </p>
                <ul className="space-y-2">
                  {footerLinks.products.marques.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 transition-colors hover:text-primary"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Catégories
                </p>
                <ul className="space-y-2">
                  {footerLinks.products.categories.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 transition-colors hover:text-primary"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Col 3: Ressources (Blog, Guides, Comparatif) */}
          <div>
            <h3 className={footerTitleClass}>Ressources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Légal */}
          <div>
            <h3 className={footerTitleClass}>Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/80">
        <div className="container py-6">
          <p className="text-center text-sm text-slate-500">
            © 2026 AirFryerDeal. Fait avec passion.
          </p>
        </div>
      </div>

      {/* Affiliate Disclaimer */}
      <div className="border-t border-slate-800/80 bg-black/30">
        <div className="container py-4">
          <p className="text-center text-xs text-slate-500">
            <strong>Disclaimer :</strong> AirFryer Deal participe au Programme
            Partenaires d&apos;Amazon EU et à d&apos;autres programmes
            d&apos;affiliation. Les prix affichés sont indicatifs et peuvent
            varier.
          </p>
        </div>
      </div>
    </footer>
  );
}
