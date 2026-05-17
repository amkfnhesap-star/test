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

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <nav className="flex-1 p-3 pt-4 space-y-0.5 overflow-y-auto">
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
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
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
        </nav>
      </aside>

      {/* Right side: header + content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 flex-shrink-0 flex items-center gap-3 px-6 bg-zinc-900 border-b border-zinc-800">
          <span className="font-semibold text-white text-sm">Admin Panel</span>
          <span className="text-zinc-700 text-xs select-none">|</span>
          <span className="text-xs text-zinc-400">
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

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto bg-zinc-950">{children}</main>
      </div>
    </div>
  );
}
