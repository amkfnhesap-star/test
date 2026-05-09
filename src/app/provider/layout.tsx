"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  Calendar,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/provider/dashboard" },
  { icon: Briefcase, label: "Job Requests", href: "/provider/jobs", badge: 3 },
  { icon: DollarSign, label: "Earnings", href: "/provider/earnings" },
  { icon: Calendar, label: "Calendar", href: "/provider/calendar" },
  { icon: BarChart2, label: "Analytics", href: "/provider/analytics" },
  { icon: Settings, label: "Settings", href: "/provider/settings" },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-16 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 z-30 flex flex-col border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Provider info */}
        {!collapsed && (
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name="Marcus J." src="https://i.pravatar.cc/40?img=12" size="sm" isOnline={isAvailable} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">Marcus Johnson</p>
                <p className="text-xs text-zinc-400 truncate">Handyman Pro</p>
              </div>
            </div>
            {/* Availability toggle */}
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all border",
                isAvailable
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
              )}
            >
              <span>{isAvailable ? "Available for work" : "Set as unavailable"}</span>
              {isAvailable ? (
                <ToggleRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-zinc-400" />
              )}
            </button>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ icon: Icon, label, href, badge }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                  isActive
                    ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-brand-500")} />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && badge && (
                  <span className="ml-auto h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-xs"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      <main className={cn("flex-1 transition-all duration-300", collapsed ? "ml-16" : "ml-56")}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
