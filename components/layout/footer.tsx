import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Mail,
  MapPin,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";

const footerLinks = {
  categories: [
    { name: "Air Fryers Compacts", href: "/categorie/compact" },
    { name: "Air Fryers Familiaux", href: "/categorie/family" },
    { name: "Air Fryers XXL", href: "/categorie/xxl" },
    { name: "Fours Air Fryer", href: "/categorie/oven" },
    { name: "Déshydrateurs", href: "/categorie/dehydrator" },
  ],
  brands: [
    { name: "Ninja", href: "/marque/ninja" },
    { name: "Philips", href: "/marque/philips" },
    { name: "Cosori", href: "/marque/cosori" },
    { name: "Tefal", href: "/marque/tefal" },
    { name: "Moulinex", href: "/marque/moulinex" },
    { name: "Xiaomi", href: "/marque/xiaomi" },
  ],
  guides: [
    { name: "Comment choisir son Air Fryer", href: "/guides/comment-choisir" },
    { name: "Comparatif 2024", href: "/guides/comparatif-2024" },
    { name: "Recettes Air Fryer", href: "/guides/recettes" },
    { name: "Entretien & Nettoyage", href: "/guides/entretien" },
    { name: "FAQ Air Fryers", href: "/guides/faq" },
  ],
  legal: [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "Politique de confidentialité", href: "/confidentialite" },
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

export function Footer() {
  return (
    <footer className="dark-section">
      {/* Main Footer */}
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Description */}
          <div className="space-y-4">
            <Logo variant="footer" className="text-white" />
            <p className="text-sm text-gray-400">
              Votre guide expert pour choisir le meilleur air fryer. Tests
              complets, comparatifs détaillés et avis d&apos;experts pour une
              cuisine saine et croustillante.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-white/10 p-2 transition-colors hover:bg-primary hover:text-white"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Catégories
            </h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Brands */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Marques
            </h3>
            <ul className="space-y-3">
              {footerLinks.brands.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Guides & Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Guides & Ressources
            </h3>
            <ul className="space-y-3">
              {footerLinks.guides.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="mb-3 text-sm font-semibold text-white">
                Newsletter
              </h4>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  OK
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} AirFryer Deal. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Affiliate Disclaimer */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container py-4">
          <p className="text-center text-xs text-gray-500">
            <strong>Disclaimer :</strong> AirFryer Deal participe au Programme
            Partenaires d&apos;Amazon EU et à d&apos;autres programmes
            d&apos;affiliation. En tant que Partenaire Amazon, nous réalisons un
            bénéfice sur les achats remplissant les conditions requises. Les
            prix affichés sont indicatifs et peuvent varier.
          </p>
        </div>
      </div>
    </footer>
  );
}
