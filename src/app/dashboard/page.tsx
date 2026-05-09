"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { bookings, conversations, providers } from "@/data/dummy";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

const stats = [
  { label: "Total Bookings", value: "12", icon: Calendar, change: "+3 this month", color: "text-brand-500 bg-brand-50 dark:bg-brand-900/20" },
  { label: "Active Bookings", value: "2", icon: Clock, change: "2 upcoming", color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
  { label: "Avg Rating Given", value: "4.9", icon: Star, change: "Top reviewer", color: "text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
  { label: "Total Spent", value: "$1,240", icon: TrendingUp, change: "Last 30 days", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
];

export default function CustomerDashboard() {
  const upcoming = bookings.filter((b) =>
    ["accepted", "pending"].includes(b.status)
  );
  const recent = bookings.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Good morning, John! 👋
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Here&apos;s what&apos;s happening with your bookings.
          </p>
        </div>
        <Link href="/search">
          <Button size="md">
            Find a Pro
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-0.5">
              {stat.value}
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">{stat.change}</div>
          </motion.div>
        ))}
      </div>

      {/* AI suggestion banner */}
      <div className="bg-gradient-to-r from-brand-500 to-violet-600 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">
              AI Recommendation for You
            </p>
            <p className="text-white/80 text-xs mt-0.5">
              Based on your past bookings, it&apos;s time to schedule your monthly deep clean!
            </p>
          </div>
        </div>
        <Link href="/search?category=cleaning">
          <button className="flex-shrink-0 px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors">
            Book Now
          </button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming bookings */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Upcoming Bookings
            </h2>
            <Link
              href="/dashboard/bookings"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No upcoming bookings</p>
              <Link href="/search" className="text-xs text-brand-500 mt-2 block hover:underline">
                Browse services →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800"
                >
                  <Image
                    src={booking.provider.avatar_url}
                    alt={booking.provider.full_name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {booking.service_title}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getStatusColor(booking.status)}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{booking.provider.full_name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(booking.scheduled_at)}
                      <span>·</span>
                      {formatCurrency(booking.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Recent Messages
            </h2>
            <Link
              href="/dashboard/messages"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link key={conv.id} href="/dashboard/messages">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <Avatar
                    src={conv.other_user.avatar_url}
                    name={conv.other_user.name}
                    size="md"
                    isOnline={conv.other_user.is_online}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {conv.other_user.name}
                      </p>
                      <span className="text-[10px] text-zinc-400 flex-shrink-0">
                        {new Date(conv.last_message_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {conv.last_message}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="h-5 w-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings history */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            Recent Bookings
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                {["Provider", "Service", "Date", "Amount", "Status"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {recent.map((booking) => (
                <tr key={booking.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src={booking.provider.avatar_url}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-lg object-cover"
                      />
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {booking.provider.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                    {booking.service_title}
                  </td>
                  <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                    {formatDate(booking.scheduled_at)}
                  </td>
                  <td className="py-3 px-3 font-medium text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(booking.total)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
