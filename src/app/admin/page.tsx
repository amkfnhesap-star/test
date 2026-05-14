"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
} from "recharts";
import {
  Users,
  Shield,
  Briefcase,
  Heart,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { categories } from "@/data/dummy";

// --- Types ---

interface Stats {
  totalUsers: number;
  totalActiveProviders: number;
  totalOpenJobs: number;
  totalFavorites: number;
  signupsThisWeek: number;
  jobsThisWeek: number;
  users_trend_pct: number | null;
  providers_trend_pct: number | null;
  jobs_trend_pct: number | null;
  favorites_trend_pct: number | null;
}

interface ActivityEvent {
  type: "signup" | "job" | "provider";
  timestamp: string;
  label: string;
  email: string;
}

interface TimeseriesPoint {
  date: string;
  signups: number;
  jobs: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface TopProvider {
  user_id: string;
  headline: string;
  average_rating: number;
  jobs_completed: number;
  main_category: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

interface LatestJob {
  id: string;
  title: string;
  category: string;
  city: string | null;
  budget: number | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

// --- Constants ---

const CHART_COLORS = { signups: "#6366f1", jobs: "#06b6d4" };
const DONUT_COLORS = [
  "#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e",
  "#8b5cf6", "#0ea5e9", "#84cc16", "#fb923c", "#a78bfa",
];
const DARK_TOOLTIP = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: "8px",
  color: "#f4f4f5",
  fontSize: "11px",
};

const EVENT_CONFIG: Record<
  ActivityEvent["type"],
  { label: string; bg: string; text: string; Icon: React.ElementType }
> = {
  signup: { label: "Sign-up", bg: "bg-emerald-500/10", text: "text-emerald-400", Icon: UserPlus },
  job: { label: "Job Posted", bg: "bg-blue-500/10", text: "text-blue-400", Icon: Briefcase },
  provider: { label: "Provider", bg: "bg-violet-500/10", text: "text-violet-400", Icon: Shield },
};

// --- Sub-components ---

function TrendBadge({ trend }: { trend: number | null | undefined }) {
  if (trend == null) return null;
  if (trend === 0)
    return (
      <span className="flex items-center gap-0.5 text-[11px] text-zinc-500">
        <Minus className="h-3 w-3" />
        0%
      </span>
    );
  if (trend > 0)
    return (
      <span className="flex items-center gap-0.5 text-[11px] text-emerald-400 font-medium">
        <TrendingUp className="h-3 w-3" />+{trend}%
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-[11px] text-red-400 font-medium">
      <TrendingDown className="h-3 w-3" />
      {trend}%
    </span>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend: number | null | undefined;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0", iconBg)}>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-white leading-none tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-[11px] text-zinc-500 mt-0.5">{label}</p>
      </div>
      <TrendBadge trend={trend} />
    </div>
  );
}

// --- Main Component ---

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [topProviders, setTopProviders] = useState<TopProvider[]>([]);
  const [latestJobs, setLatestJobs] = useState<LatestJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const h = { Authorization: `Bearer ${token}` };

      const [statsRes, activityRes, timeseriesRes, catRes, topProvsRes, latestJobsRes] =
        await Promise.all([
          fetch("/api/admin/stats", { headers: h }),
          fetch("/api/admin/recent-activity", { headers: h }),
          fetch("/api/admin/charts/activity-timeseries?days=90", { headers: h }),
          fetch("/api/admin/charts/jobs-by-category", { headers: h }),
          fetch("/api/admin/dashboard/top-providers", { headers: h }),
          fetch("/api/admin/dashboard/latest-jobs", { headers: h }),
        ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (activityRes.ok) {
        const d = await activityRes.json();
        setActivity(d.events ?? []);
      }
      if (timeseriesRes.ok) {
        const d = await timeseriesRes.json();
        setTimeseries(d.timeseries ?? []);
      }
      if (catRes.ok) {
        const d = await catRes.json();
        setCategoryData(d.categories ?? []);
      }
      if (topProvsRes.ok) {
        const d = await topProvsRes.json();
        setTopProviders(d.providers ?? []);
      }
      if (latestJobsRes.ok) {
        const d = await latestJobsRes.json();
        setLatestJobs(d.jobs ?? []);
      }

      setLoading(false);
    }

    load();
  }, []);

  const totalJobs = categoryData.reduce((sum, c) => sum + c.count, 0);

  if (loading) {
    return (
      <div className="p-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
            <div className="h-64 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-48 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
            <div className="h-48 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
          </div>
        </div>
        <div className="w-full lg:w-80 h-96 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-6 min-h-0">
      {/* ── Main area ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Platform overview · trends vs previous 30 days
          </p>
        </div>

        {/* KPI strip */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Total Users"
              value={stats.totalUsers}
              icon={Users}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-400"
              trend={stats.users_trend_pct}
            />
            <KpiCard
              label="Active Providers"
              value={stats.totalActiveProviders}
              icon={Shield}
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-400"
              trend={stats.providers_trend_pct}
            />
            <KpiCard
              label="Open Jobs"
              value={stats.totalOpenJobs}
              icon={Briefcase}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-400"
              trend={stats.jobs_trend_pct}
            />
            <KpiCard
              label="Total Favorites"
              value={stats.totalFavorites}
              icon={Heart}
              iconBg="bg-red-500/10"
              iconColor="text-red-400"
              trend={stats.favorites_trend_pct}
            />
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Activity line chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">
              Activity — last 90 days
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={timeseries}
                margin={{ top: 4, right: 8, left: -22, bottom: 0 }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717a", fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  interval={14}
                  tickFormatter={(v: string) => v.slice(5).replace("-", "/")}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <ReTooltip
                  contentStyle={DARK_TOOLTIP}
                  cursor={{ stroke: "#3f3f46" }}
                  labelFormatter={(v: string) => v}
                />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: "10px", color: "#a1a1aa", paddingTop: "8px" }}
                />
                <Line
                  type="monotone"
                  dataKey="signups"
                  name="Sign-ups"
                  stroke={CHART_COLORS.signups}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  name="Jobs Posted"
                  stroke={CHART_COLORS.jobs}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">
              Jobs by Category
            </h2>
            {categoryData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-zinc-600 text-sm">
                No data yet
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {categoryData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                          />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (!viewBox || !("cx" in viewBox)) return null;
                            const { cx, cy } = viewBox as { cx: number; cy: number };
                            return (
                              <g>
                                <text
                                  x={cx}
                                  y={cy - 6}
                                  textAnchor="middle"
                                  fill="#fff"
                                  fontSize={18}
                                  fontWeight="bold"
                                >
                                  {totalJobs}
                                </text>
                                <text
                                  x={cx}
                                  y={cy + 10}
                                  textAnchor="middle"
                                  fill="#71717a"
                                  fontSize={9}
                                >
                                  total jobs
                                </text>
                              </g>
                            );
                          }}
                          position="center"
                        />
                      </Pie>
                      <ReTooltip
                        contentStyle={DARK_TOOLTIP}
                        formatter={(value: number, name: string) => {
                          const pct =
                            totalJobs > 0
                              ? Math.round((value / totalJobs) * 100)
                              : 0;
                          return [`${value} (${pct}%)`, name];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex flex-col gap-1 flex-shrink-0 max-w-[96px]">
                  {categoryData.slice(0, 8).map((c, i) => {
                    const catDef = categories.find((cat) => cat.slug === c.category);
                    return (
                      <div key={c.category} className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                        />
                        <span className="text-[10px] text-zinc-400 truncate">
                          {catDef?.name ?? c.category}
                        </span>
                      </div>
                    );
                  })}
                  {categoryData.length > 8 && (
                    <span className="text-[10px] text-zinc-600">
                      +{categoryData.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Providers */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Top Providers
              </h2>
              <Link
                href="/admin/providers"
                className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
              >
                View all →
              </Link>
            </div>
            {topProviders.length === 0 ? (
              <p className="text-zinc-600 text-xs py-6 text-center">No providers yet</p>
            ) : (
              <div className="space-y-0.5">
                {topProviders.map((p, i) => (
                  <Link
                    key={p.user_id}
                    href="/admin/providers"
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
                  >
                    <span className="text-[10px] text-zinc-600 w-3 flex-shrink-0 tabular-nums">
                      {i + 1}
                    </span>
                    <Avatar
                      name={p.profiles?.full_name ?? "?"}
                      src={p.profiles?.avatar_url ?? undefined}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">
                        {p.profiles?.full_name ?? "Unknown"}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">{p.headline}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] text-zinc-300 tabular-nums">
                        {p.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 flex-shrink-0 tabular-nums">
                      {p.jobs_completed}j
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Latest Jobs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Latest Jobs
              </h2>
              <Link
                href="/admin/jobs"
                className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
              >
                View all →
              </Link>
            </div>
            {latestJobs.length === 0 ? (
              <p className="text-zinc-600 text-xs py-6 text-center">No jobs yet</p>
            ) : (
              <div className="space-y-0.5">
                {latestJobs.map((job) => {
                  const cat = categories.find((c) => c.slug === job.category);
                  return (
                    <Link
                      key={job.id}
                      href="/admin/jobs"
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-200 truncate">{job.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                            {cat?.name ?? job.category}
                          </span>
                          {job.city && (
                            <span className="text-[10px] text-zinc-600 truncate">{job.city}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] text-zinc-300 tabular-nums">
                          {job.budget ? `${job.budget.toLocaleString()} RON` : "Open"}
                        </p>
                        <p className="text-[10px] text-zinc-600">
                          {formatRelativeTime(job.created_at)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Activity Sidebar ── */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:sticky lg:top-4">
          <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Recent Activity
            <span className="text-zinc-700 font-normal ml-1 normal-case">· last 20</span>
          </h2>

          {activity.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-zinc-600 text-xs">No activity yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {activity.map((event, i) => {
                const { label: typeLabel, bg, text, Icon } = EVENT_CONFIG[event.type];
                return (
                  <div key={i} className="flex items-start gap-2 py-2 first:pt-0 last:pb-0">
                    <div
                      className={cn(
                        "h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5",
                        bg
                      )}
                    >
                      <Icon className={cn("h-3 w-3", text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span
                          className={cn(
                            "text-[9px] font-semibold px-1 py-0.5 rounded",
                            bg,
                            text
                          )}
                        >
                          {typeLabel}
                        </span>
                        <span className="text-[11px] text-zinc-300 truncate">
                          {event.label}
                        </span>
                      </div>
                      {event.email && (
                        <p className="text-[10px] text-zinc-600 mt-0.5 truncate">
                          {event.email}
                        </p>
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-600 flex-shrink-0 mt-0.5">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
