"use client";

import Link from "next/link";
import { Zap, Twitter, Linkedin, Instagram, Github, ArrowRight } from "lucide-react";

const footerLinks = {
  Servicii: [
    { label: "Explorează servicii", href: "/search" },
    { label: "Curățenie", href: "/search?category=cleaning" },
    { label: "Reparații generale", href: "/search?category=handyman" },
    { label: "Servicii AI", href: "/search?category=ai-services" },
    { label: "Fotografie", href: "/search?category=photography" },
  ],
  Meșteri: [
    { label: "Devino meșter", href: "/register?role=provider" },
    { label: "Panou meșter", href: "/provider/dashboard" },
    { label: "Câștiguri", href: "/provider/earnings" },
    { label: "Povești de succes", href: "/#testimonials" },
    { label: "FAQ Meșteri", href: "/faq#providers" },
  ],
  Companie: [
    { label: "Despre noi", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Cariere", href: "/careers" },
    { label: "Presă", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Politica de confidențialitate", href: "/privacy" },
    { label: "Termeni și condiții", href: "/terms" },
    { label: "Politica cookie", href: "/cookies" },
    { label: "Accesibilitate", href: "/accessibility" },
  ],
};

const socials = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400">
      {/* Newsletter CTA */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">
                Primești cei mai buni meșteri direct în inbox
              </h3>
              <p className="text-zinc-400 text-sm">
                Meșteri noi, promoții și noutăți de pe platformă, săptămânal.
              </p>
            </div>
            <form
              className="flex w-full max-w-sm gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Adresa ta de email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-500 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-violet-600 text-white text-sm font-medium hover:shadow-glow transition-all duration-200 flex items-center gap-1"
              >
                Abonează-te <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Meste<span className="text-brand-400">RO</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              Platforma AI pentru meșteri locali de încredere.
            </p>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-3">
                {section}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} MesteRO SRL. Toate drepturile rezervate.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-zinc-600">
              🔒 Criptare SSL 256 biți
            </span>
            <span className="text-xs text-zinc-600">
              ✅ Acoperire civilă 1M$
            </span>
            <span className="text-xs text-zinc-600">
              🌱 Platformă neutră carbon
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
