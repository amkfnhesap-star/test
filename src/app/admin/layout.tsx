"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Shield,
  Heart,
  ScrollText,
  Settings,
  ArrowLeft,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { label: "Providers", href: "/admin/providers", icon: Shield },
  { label: "Reviews", href: "/admin/reviews", icon: MessageCircle },
  { label: "Favorites", href: "/admin/favorites", icon: Heart },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userEmail = session?.user?.email ?? null;
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (!userEmail || !adminEmail || userEmail !== adminEmail) {
        router.replace("/");
        return;
      }

      setEmail(userEmail);
      setChecking(false);
    });
  }, [router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const NavLinks = () => (
    <>
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive =
          href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px]",
              isActive
                ? "bg-brand-500/15 text-brand-400"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex-col">
        <nav className="flex-1 p-3 pt-4 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <aside className="fixed left-0 top-0 bottom-0 z-50 w-56 flex flex-col bg-zinc-900 border-r border-zinc-800 md:hidden">
          <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-white">Admin</span>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            <NavLinks />
          </nav>
        </aside>
      )}

      {/* Right side: header + content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 flex-shrink-0 flex items-center gap-3 px-4 md:px-6 bg-zinc-900 border-b border-zinc-800">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 transition-colors"
            aria-label="Deschide meniu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="font-semibold text-white text-sm">Admin Panel</span>
          <span className="text-zinc-700 text-xs select-none hidden sm:inline">|</span>
          <span className="text-xs text-zinc-400 hidden sm:inline">
            Logged in as{" "}
            <span className="text-zinc-200">{email}</span>
          </span>
          <Link
            href="/"
            className="ml-auto flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </header>

        {/* Main scrollable area — overflow-x-auto on inner content prevents page-level scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-zinc-950">{children}</main>
      </div>
    </div>
  );
}
