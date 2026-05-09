"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Filter, Search } from "lucide-react";
import { bookings } from "@/data/dummy";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const statusFilters = ["all", "pending", "accepted", "in_progress", "completed", "cancelled"];

export default function BookingsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search && !b.service_title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Bookings</h1>
        <Link href="/search">
          <Button size="sm">Book a Service</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
              filter === s
                ? "bg-brand-500 text-white"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-brand-300"
            )}
          >
            {s === "all" ? "All Bookings" : getStatusLabel(s)}
          </button>
        ))}
      </div>

      {/* Booking list */}
      <div className="space-y-3">
        {filtered.map((booking, i) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5"
          >
            <div className="flex items-start gap-4">
              <Image
                src={booking.provider.avatar_url}
                alt={booking.provider.full_name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{booking.service_title}</h3>
                    <p className="text-sm text-zinc-400 mt-0.5">with {booking.provider.full_name}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(booking.scheduled_at)}
                  </span>
                  <span>{booking.address}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(booking.total)}</span>
                  <div className="flex gap-2">
                    {booking.status === "completed" && (
                      <Button size="sm" variant="secondary">Leave Review</Button>
                    )}
                    <Button size="sm" variant="ghost">View Details</Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
