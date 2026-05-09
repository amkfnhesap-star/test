"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  MoreVertical,
  BarChart2,
  Eye,
  Flag,
  Zap,
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
import { providers, bookings, analyticsData, platformStats } from "@/data/dummy";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const statCards = [
  { label: "Total Users", value: formatNumber(platformStats.total_providers + platformStats.total_customers), icon: Users, change: "+2.4k today", color: "text-brand-500 bg-brand-50 dark:bg-brand-900/20" },
  { label: "Monthly Revenue", value: formatCurrency(450000), icon: DollarSign, change: "+18% MoM", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
  { label: "Active Bookings", value: formatNumber(platformStats.active_bookings), icon: TrendingUp, change: "Right now", color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
  { label: "Pending Verifications", value: "47", icon: Shield, change: "Needs review", color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20" },
];

const revenueData = analyticsData.map((d) => ({
  ...d,
  revenue: d.earnings * 12,
}));

const pendingVerifications = providers.slice(0, 4).map((p) => ({
  ...p,
  applied_at: "2025-01-10",
  docs: ["ID Verified", "License Pending", "Background Check Done"],
}));

const disputes = [
  { id: "d1", customer: "Sarah M.", provider: "Unknown Pro", service: "Cleaning", amount: 120, reason: "Work not completed", created: "2025-01-12", status: "open" },
  { id: "d2", customer: "Jason K.", provider: "John D.", service: "Handyman", amount: 200, reason: "Did not show up", created: "2025-01-11", status: "reviewing" },
  { id: "d3", customer: "Mike L.", provider: "Carlos M.", service: "Moving", amount: 350, reason: "Item damaged", created: "2025-01-10", status: "resolved" },
];

const adminTabs = ["Overview", "Users", "Verifications", "Disputes", "Moderation"] as const;
type Tab = typeof adminTabs[number];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = providers.filter((p) =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Panel</h1>
              <p className="text-sm text-zinc-500">SkillSeekers Platform Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="danger" dot>47 pending</Badge>
            <Button size="sm" variant="secondary">
              <BarChart2 className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-8 w-fit">
          {adminTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "Overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5"
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{stat.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-1">{stat.change}</div>
                </motion.div>
              ))}
            </div>

            {/* Revenue chart */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-zinc-900 dark:text-white">Platform Revenue</h2>
                <Badge variant="success" dot>Live</Badge>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} formatter={(v: number) => [`$${v}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
                    <Area type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2} fill="url(#bookGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick actions + Disputes */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Open disputes */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Open Disputes
                  </h2>
                  <Badge variant="warning">{disputes.filter(d => d.status !== "resolved").length} open</Badge>
                </div>
                <div className="space-y-3">
                  {disputes.map((d) => (
                    <div key={d.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-900 dark:text-white">{d.service}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            d.status === "open" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                            d.status === "reviewing" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                            "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{d.customer} vs {d.provider}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 italic">"{d.reason}"</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-zinc-900 dark:text-white text-sm">{formatCurrency(d.amount)}</div>
                        <button className="text-xs text-brand-600 dark:text-brand-400 mt-1 hover:underline">
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform health */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
                <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  Platform Health
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Fraud Detection Rate", value: "99.8%", color: "from-emerald-400 to-emerald-600", width: "99.8%" },
                    { label: "Provider Satisfaction", value: "94%", color: "from-brand-400 to-brand-600", width: "94%" },
                    { label: "Customer Satisfaction", value: "97%", color: "from-violet-400 to-violet-600", width: "97%" },
                    { label: "Payment Success Rate", value: "99.9%", color: "from-amber-400 to-orange-600", width: "99.9%" },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-zinc-600 dark:text-zinc-400">{metric.label}</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">{metric.value}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: metric.width }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users tab */}
        {activeTab === "Users" && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-zinc-900 dark:text-white">Provider Management</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2 border border-zinc-200 dark:border-zinc-700">
                  <Search className="h-3.5 w-3.5 text-zinc-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none w-40"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    {["Provider", "Location", "Rating", "Jobs", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <Image src={provider.avatar_url} alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
                          <div>
                            <p className="font-medium text-zinc-800 dark:text-zinc-200 text-xs">{provider.full_name}</p>
                            <p className="text-zinc-400 text-[10px]">{provider.tagline.slice(0, 30)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400 text-xs">{provider.city}</td>
                      <td className="py-3 px-3">
                        <span className="flex items-center gap-1 text-xs">
                          <span className="text-amber-400">★</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">{provider.rating}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400 text-xs">{provider.job_count}</td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={provider.verification_status === "verified" ? "success" : "warning"}
                          dot
                        >
                          {provider.verification_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Flag className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Verifications tab */}
        {activeTab === "Verifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-zinc-900 dark:text-white">
                Pending Verifications
              </h2>
              <Badge variant="warning" dot>47 pending</Badge>
            </div>
            {pendingVerifications.map((pv) => (
              <div key={pv.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
                <div className="flex items-start gap-4">
                  <Image src={pv.avatar_url} alt="" width={48} height={48} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">{pv.full_name}</h3>
                        <p className="text-sm text-zinc-400 mt-0.5">{pv.categories.join(", ")} · {pv.city}</p>
                        <p className="text-xs text-zinc-400 mt-1">Applied: {pv.applied_at}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {pv.docs.map((doc) => (
                        <span key={doc} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${
                          doc.includes("Pending")
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}>
                          {doc.includes("Pending") ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disputes & Moderation tabs - simplified */}
        {(activeTab === "Disputes" || activeTab === "Moderation") && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8 text-center">
            <div className="text-4xl mb-3">{activeTab === "Disputes" ? "⚖️" : "🔍"}</div>
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              {activeTab} Management
            </h3>
            <p className="text-zinc-400 text-sm">
              Full {activeTab.toLowerCase()} panel with AI-assisted resolution tools.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
