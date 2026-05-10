"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Zap,
  Bell,
  MessageSquare,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { supabase, signOut } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  {
    label: "Browse",
    href: "/search",
    children: [
      { label: "Browse Pros", href: "/pros" },
      { label: "Cleaning", href: "/search?category=cleaning" },
      { label: "Handyman", href: "/search?category=handyman" },
      { label: "Moving", href: "/search?category=moving" },
      { label: "AI Services", href: "/search?category=ai-services" },
      { label: "View All Jobs", href: "/search" },
    ],
  },
  { label: "For Providers", href: "/provider/onboarding" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

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

  const isHome = pathname === "/";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-all duration-300",
          scrolled || !isHome
            ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span
                  className={cn(
                    "transition-colors",
                    scrolled || !isHome
                      ? "text-zinc-900 dark:text-white"
                      : "text-white"
                  )}
                >
                  Skill
                </span>
                <span className="text-brand-500">Seekers</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() =>
                    link.children && setActiveDropdown(link.label)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      scrolled || !isHome
                        ? "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown className="h-3 w-3 mt-0.5" />
                    )}
                  </Link>

                  {link.children && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-48 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl py-1.5"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
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
              {/* Post a Job — visible to everyone on desktop */}
              <Link
                href={user ? "/jobs/new" : "/login?redirect=/jobs/new"}
                className={cn(
                  "hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                  scrolled || !isHome
                    ? "border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                    : "border-white/40 text-white hover:bg-white/10"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Post a Job
              </Link>

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() =>
                    setTheme(theme === "dark" ? "light" : "dark")
                  }
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    scrolled || !isHome
                      ? "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      : "text-white/80 hover:bg-white/10"
                  )}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
              )}

              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/dashboard/my-jobs"
                    className={cn(
                      "text-sm font-medium px-3 py-1.5 rounded-lg transition-colors",
                      scrolled || !isHome
                        ? "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        : "text-white/80 hover:bg-white/10"
                    )}
                  >
                    My Jobs
                  </Link>
                  <Link href="/dashboard/messages">
                    <button className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <MessageSquare className="h-4 w-4" />
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
                    className={cn(
                      "text-sm font-medium px-3 py-1.5 rounded-lg transition-colors",
                      scrolled || !isHome
                        ? "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        : "text-white/80 hover:bg-white/10"
                    )}
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        scrolled || !isHome
                          ? ""
                          : "text-white hover:bg-white/10"
                      )}
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className={cn(
                  "md:hidden p-2 rounded-lg transition-colors",
                  scrolled || !isHome
                    ? "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    : "text-white hover:bg-white/10"
                )}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
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
            className="fixed top-16 inset-x-0 z-30 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden md:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={user ? "/jobs/new" : "/login?redirect=/jobs/new"}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Post a Job
              </Link>
              <div className="pt-3 pb-1 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                {user ? (
                  <>
                    <Link href="/dashboard/my-jobs" className="flex-1">
                      <Button variant="secondary" size="md" fullWidth>
                        My Jobs
                      </Button>
                    </Link>
                    <Button size="md" fullWidth onClick={handleSignOut}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex-1">
                      <Button variant="secondary" size="md" fullWidth>
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button size="md" fullWidth>
                        Get Started
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
