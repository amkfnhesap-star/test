"use client";

import Link from "next/link";
import { Zap, Twitter, Linkedin, Instagram, Github, ArrowRight } from "lucide-react";

const footerLinks = {
  Services: [
    { label: "Browse Services", href: "/search" },
    { label: "Cleaning", href: "/search?category=cleaning" },
    { label: "Handyman", href: "/search?category=handyman" },
    { label: "AI Services", href: "/search?category=ai-services" },
    { label: "Photography", href: "/search?category=photography" },
  ],
  Providers: [
    { label: "Become a Provider", href: "/register?role=provider" },
    { label: "Provider Dashboard", href: "/provider/dashboard" },
    { label: "Earnings", href: "/provider/earnings" },
    { label: "Success Stories", href: "/#testimonials" },
    { label: "Provider FAQ", href: "/faq#providers" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Accessibility", href: "/accessibility" },
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
                Get the best pros delivered to your inbox
              </h3>
              <p className="text-zinc-400 text-sm">
                New providers, promotions, and platform updates weekly.
              </p>
            </div>
            <form
              className="flex w-full max-w-sm gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-500 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-violet-600 text-white text-sm font-medium hover:shadow-glow transition-all duration-200 flex items-center gap-1"
              >
                Subscribe <ArrowRight className="h-3.5 w-3.5" />
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
                Skill<span className="text-brand-400">Seekers</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              The AI-native marketplace for trusted local professionals.
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
            © {new Date().getFullYear()} SkillSeekers, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-zinc-600">
              🔒 256-bit SSL encrypted
            </span>
            <span className="text-xs text-zinc-600">
              ✅ $1M liability coverage
            </span>
            <span className="text-xs text-zinc-600">
              🌱 Carbon neutral platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
