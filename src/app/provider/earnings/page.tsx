"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { analyticsData, bookings } from "@/data/dummy";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const earningsSummary = [
  { label: "Total Earned", value: "$5,200", icon: DollarSign, change: "+32%", up: true },
  { label: "This Month", value: "$1,050", icon: TrendingUp, change: "+18%", up: true },
  { label: "Pending Payout", value: "$418", icon: Clock, change: "Friday", up: null },
  { label: "Avg Per Job", value: "$148", icon: ArrowUpRight, change: "+$12", up: true },
];

const completedBookings = bookings.filter((b) => b.status === "completed");

export default function EarningsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Earnings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Track your income and payout history.
          </p>
        </div>
        <Button variant="secondary" size="md">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {earningsSummary.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                <item.icon className="h-4 w-4 text-brand-500" />
              </div>
              {item.up !== null && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ${item.up ? "text-emerald-500" : "text-red-500"}`}>
                  {item.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {item.change}
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{item.value}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{item.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-5">Weekly Earnings</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} formatter={(v: number) => [`$${v}`, "Earnings"]} />
                <Area type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2} fill="url(#earningsGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-5">Bookings Per Week</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payout section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Pending Payout</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Releases every Friday via bank transfer</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$418.00</div>
            <div className="text-xs text-zinc-400">Next payout: Jan 17</div>
          </div>
        </div>
        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "78%" }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-zinc-400 mt-2">$418 of $536 threshold met for weekly payout</p>
      </div>

      {/* Transaction history */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                {["Date", "Service", "Customer", "Amount", "Platform Fee", "Net", "Status"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-xs">
                    {formatDate(booking.scheduled_at)}
                  </td>
                  <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300 text-xs">{booking.service_title}</td>
                  <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400 text-xs">Customer #{booking.customer_id.slice(-4)}</td>
                  <td className="py-3 px-3 font-medium text-zinc-800 dark:text-zinc-200 text-xs">{formatCurrency(booking.price)}</td>
                  <td className="py-3 px-3 text-red-500 dark:text-red-400 text-xs">-{formatCurrency(booking.platform_fee)}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 text-xs">{formatCurrency(booking.price - booking.platform_fee)}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(booking.status)}`}>
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
