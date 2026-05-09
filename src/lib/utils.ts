import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
    accepted: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    in_progress: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30",
    completed: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
    cancelled: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
    disputed: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
  };
  return map[status] ?? "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    accepted: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    disputed: "In Dispute",
  };
  return map[status] ?? status;
}
