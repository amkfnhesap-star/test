"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Star,
  Briefcase,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { bookings, analyticsData } from "@/data/dummy";
import { formatCurrency, getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

const stats = [
  { label: "This Month", value: "$1,050", icon: DollarSign, change: "+32%", up: true, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
  { label: "Pending Payout", value: "$418", icon: Clock, change: "Releases Friday", up: null, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
  { label: "Avg Rating", value: "4.9", icon: Star, change: "+0.1 this month", up: true, color: "text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
  { label: "Active Jobs", value: "3", icon: Briefcase, change: "2 pending review", up: null, color: "text-brand-500 bg-brand-50 dark:bg-brand-900/20" },
];

const pendingJobs = bookings.filter((b) => ["pending", "accepted"].includes(b.status)).slice(0, 3);

export default function ProviderDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Provider Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Wednesday, Jan 15 · 3 new job requests
          </p>
        </div>
        <Button size="md" variant="secondary">
          <Eye className="h-4 w-4 mr-2" />
          View Profile
        </Button>
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
              {stat.up !== null && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-emerald-500" : "text-red-500"}`}>
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-0.5">
              {stat.value}
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </div>
            {stat.up === null && (
              <div className="text-[10px] text-zinc-400 mt-1">{stat.change}</div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Earnings chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Earnings Overview
            </h2>
            <div className="flex gap-1 p-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              {["1W", "1M", "3M", "1Y"].map((p) => (
                <button
                  key={p}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    p === "1M"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(v: number) => [`$${v}`, "Earnings"]}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#earningsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          {/* Profile views */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Profile Views (7 days)</p>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">420</div>
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                <ArrowUpRight className="h-3 w-3" />
                +23%
              </div>
            </div>
            <div className="flex gap-0.5 mt-3 h-8 items-end">
              {[30, 45, 28, 62, 55, 78, 90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-brand-500 rounded-t-sm opacity-70 hover:opacity-100 transition-opacity"
                  style={{ height: `${(h / 90) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Completion rate */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Job Completion Rate</p>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">98.2%</div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
                style={{ width: "98.2%" }}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-1.5">Above 97% platform average</p>
          </div>

          {/* Response rate */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Response Rate</p>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">100%</div>
            <Badge variant="success" dot>Excellent</Badge>
          </div>
        </div>
      </div>

      {/* Pending job requests */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            Pending Job Requests
          </h2>
          <Badge variant="danger" dot>3 new</Badge>
        </div>

        <div className="space-y-3">
          {pendingJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800"
            >
              <Image
                src={job.provider.avatar_url}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white text-sm">
                      {job.service_title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {formatDate(job.scheduled_at)} · {job.address}
                    </p>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white text-sm flex-shrink-0">
                    {formatCurrency(job.total)}
                  </span>
                </div>
                {job.notes && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    "{job.notes}"
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors">
                    <CheckCircle2 className="h-3 w-3" />
                    Accept
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
                    <AlertCircle className="h-3 w-3" />
                    Decline
                  </button>
                  <button className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-brand-600 dark:text-brand-400 text-xs font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
