"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Heart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Briefcase,
  Star,
  ShieldCheck,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { icon: Briefcase, label: "My Jobs", href: "/dashboard/my-jobs" },
  { icon: Calendar, label: "My Bookings", href: "/dashboard/bookings" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/messages", badge: 3 },
  { icon: Heart, label: "Favorites", href: "/dashboard/favorites" },
  { icon: MessageCircle, label: "Recenzii", href: "/dashboard/reviews" },
  { icon: Star, label: "Provider Profile", href: "/provider/onboarding" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  if (loading) return null;

  const SidebarContent = () => (
    <>
      {/* User info */}
      {!collapsed && user && (
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar
              name={user.user_metadata?.full_name ?? user.email ?? ""}
              size="sm"
              isOnline
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {user.user_metadata?.full_name ?? user.email}
              </p>
              <p className="text-xs text-zinc-400 truncate capitalize">
                {user.user_metadata?.role ?? "Customer"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ icon: Icon, label, href, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative min-h-[44px]",
                isActive
                  ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-brand-500")} />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && badge && (
                <span className="ml-auto h-5 w-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        {user?.email?.toLowerCase() ===
          process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() && (
          <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px]",
                pathname.startsWith("/admin")
                  ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <ShieldCheck
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  pathname.startsWith("/admin") && "text-brand-500"
                )}
              />
              {!collapsed && <span className="truncate">Admin</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full hidden md:flex items-center justify-center gap-2 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-xs"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-16 flex">
      {/* Desktop sidebar — fixed left, hidden on mobile */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 z-30 hidden md:flex flex-col border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <aside className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:hidden">
          {/* Mobile close header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 pt-20">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-zinc-900 dark:text-white">
                Meste<span className="text-brand-500">RO</span>
              </span>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SidebarContent />
        </aside>
      )}

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 min-w-0",
          collapsed ? "md:ml-16" : "md:ml-56"
        )}
      >
        {/* Mobile nav bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="h-10 w-10 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Deschide meniu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Dashboard</span>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
