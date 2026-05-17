"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Zap,
  MessageCircle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { supabase, signOut } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// TODO: Navbar is now always light (white bg). Dark pages (admin, dashboard,
// messages, etc.) will show a white navbar on a dark body until those pages
// are converted to the light theme in a follow-up session.

const navLinks = [
  {
    label: "Explorează",
    href: "/search",
    children: [
      { label: "Toate serviciile", href: "/search" },
      { label: "Lucrări disponibile", href: "/jobs" },
      { label: "Găsește meșteri (doar Pros)", href: "/search?type=providers" },
      { label: "Curățenie", href: "/search?category=cleaning" },
      { label: "Reparații generale", href: "/search?category=handyman" },
      { label: "Mutări", href: "/search?category=moving" },
      { label: "Servicii AI", href: "/search?category=ai-services" },
    ],
  },
  { label: "Pentru meșteri", href: "/provider/onboarding" },
  { label: "Cum funcționează", href: "/#how-it-works" },
  { label: "Prețuri", href: "/#pricing" },
];

export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-all duration-300 bg-white border-b border-slate-200",
          scrolled ? "shadow-md" : "shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Meste<span className="text-brand-500">RO</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                  >
                    {link.label}
                    {link.children && <ChevronDown className="h-3 w-3 mt-0.5" />}
                  </Link>

                  {link.children && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-52 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Post a Job */}
              <Link
                href={user ? "/jobs/new" : "/login?redirect=/jobs/new"}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-brand-500 text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Postează o lucrare
              </Link>

              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/dashboard/my-jobs"
                    className="text-sm font-medium px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Lucrările mele
                  </Link>
                  <Link href="/messages">
                    <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" aria-label="Mesaje">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </Link>
                  <Link href="/dashboard/my-jobs">
                    <Avatar
                      name={user.user_metadata?.full_name ?? user.email ?? ""}
                      size="sm"
                    />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Deconectează-te
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Conectează-te
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Începe acum</Button>
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Deschide meniu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 inset-x-0 z-30 bg-white border-b border-slate-200 overflow-hidden md:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={user ? "/jobs/new" : "/login?redirect=/jobs/new"}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Postează o lucrare
              </Link>
              <div className="pt-3 pb-1 border-t border-slate-100 flex gap-2">
                {user ? (
                  <>
                    <Link href="/dashboard/my-jobs" className="flex-1">
                      <Button variant="secondary" size="md" fullWidth>
                        Lucrările mele
                      </Button>
                    </Link>
                    <Button size="md" fullWidth onClick={handleSignOut}>
                      Deconectează-te
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex-1">
                      <Button variant="secondary" size="md" fullWidth>
                        Conectează-te
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button size="md" fullWidth>
                        Începe acum
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
