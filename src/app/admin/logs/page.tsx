"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Fragment } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Briefcase,
  Wrench,
  Heart,
  Shield,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatRelativeTime, cn } from "@/lib/utils";

const CATEGORY_CONFIG = {
  auth:     { icon: UserPlus,  bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  job:      { icon: Briefcase, bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/30"    },
  provider: { icon: Wrench,    bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/30"  },
  favorite: { icon: Heart,     bg: "bg-pink-500/10",    text: "text-pink-400",    border: "border-pink-500/30"    },
  admin:    { icon: Shield,    bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/30"   },
  user:     { icon: User,      bg: "bg-slate-500/10",   text: "text-slate-400",   border: "border-slate-500/30"   },
} as const;

type Category = keyof typeof CATEGORY_CONFIG;
const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];

const TABLE_LIMIT = 100;
const TIMELINE_LIMIT = 50;

interface LogRow {
  id: string;
  event_type: string;
  event_category: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  target_type: string | null;
  target_id: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface ApiResponse {
  rows: LogRow[];
  total: number;
  page: number;
  limit: number;
}

interface Filters {
  search: string;
  categories: Category[];
  fromDate: string;
  toDate: string;
}

function buildApiUrl(filters: Filters, extra: Record<string, string | number>) {
  const p = new URLSearchParams();
  if (filters.search) p.set("search", filters.search);
  if (filters.categories.length > 0) p.set("event_category", filters.categories.join(","));
  if (filters.fromDate) p.set("from", filters.fromDate);
  if (filters.toDate) p.set("to", `${filters.toDate}T23:59:59Z`);
  Object.entries(extra).forEach(([k, v]) => p.set(k, String(v)));
  return `/api/admin/logs?${p.toString()}`;
}

function CategoryBadge({ category }: { category: string }) {
  const cfg = CATEGORY_CONFIG[category as Category];
  if (!cfg) return <span className="text-xs text-zinc-500">{category}</span>;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-medium", cfg.bg, cfg.text, cfg.border)}>
      <Icon className="h-2.5 w-2.5" />
      {category}
    </span>
  );
}

export default function AdminLogsPage() {
  const [token, setToken] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Timeline state
  const [timelineRows, setTimelineRows] = useState<LogRow[]>([]);
  const [timelineTotal, setTimelineTotal] = useState(0);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const timelineOffsetRef = useRef(0);

  // Table state
  const [tableRows, setTableRows] = useState<LogRow[]>([]);
  const [tableTotal, setTableTotal] = useState(0);
  const [tablePage, setTablePage] = useState(1);
  const [tableLoading, setTableLoading] = useState(false);

  // Selection state
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const rowRefsMap = useRef<Map<string, HTMLTableRowElement>>(new Map());

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Get token
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token ?? null);
    });
  }, []);

  const filters = useMemo<Filters>(
    () => ({ search: debouncedSearch, categories: selectedCategories, fromDate, toDate }),
    [debouncedSearch, selectedCategories, fromDate, toDate]
  );

  const fetchTimeline = useCallback(async (offset: number, append: boolean, tok: string, f: Filters) => {
    setTimelineLoading(true);
    try {
      const url = buildApiUrl(f, { limit: TIMELINE_LIMIT, page: Math.floor(offset / TIMELINE_LIMIT) + 1 });
      const res = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
      const json: ApiResponse = await res.json();
      setTimelineTotal(json.total);
      setTimelineRows(prev => append ? [...prev, ...json.rows] : json.rows);
      timelineOffsetRef.current = append ? offset + json.rows.length : json.rows.length;
    } finally {
      setTimelineLoading(false);
    }
  }, []);

  const fetchTable = useCallback(async (page: number, tok: string, f: Filters) => {
    setTableLoading(true);
    try {
      const url = buildApiUrl(f, { limit: TABLE_LIMIT, page });
      const res = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
      const json: ApiResponse = await res.json();
      setTableTotal(json.total);
      setTableRows(json.rows);
    } finally {
      setTableLoading(false);
    }
  }, []);

  // Reload everything when filters change
  useEffect(() => {
    if (!token) return;
    setTimelineRows([]);
    setTableRows([]);
    setSelectedRowId(null);
    setExpandedRowId(null);
    setTablePage(1);
    timelineOffsetRef.current = 0;
    fetchTimeline(0, false, token, filters);
    fetchTable(1, token, filters);
  }, [token, filters, fetchTimeline, fetchTable]);

  // Table page change
  useEffect(() => {
    if (!token || tablePage === 1) return;
    fetchTable(tablePage, token, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablePage]);

  const totalTablePages = Math.max(1, Math.ceil(tableTotal / TABLE_LIMIT));

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleTimelineClick = (row: LogRow) => {
    setSelectedRowId(row.id);
    setExpandedRowId(null);
    rowRefsMap.current.get(row.id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleTableRowClick = (row: LogRow) => {
    setExpandedRowId(prev => prev === row.id ? null : row.id);
    setSelectedRowId(row.id);
  };

  return (
    <div className="flex overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
      {/* ── Left pane: Timeline (40%) ─────────────────────────────── */}
      <div className="w-2/5 flex flex-col border-r border-zinc-800 overflow-hidden">
        {/* Filter bar */}
        <div className="flex-shrink-0 p-3 space-y-2 border-b border-zinc-800 bg-zinc-900/50">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search description…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-8 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1">
            {ALL_CATEGORIES.map(cat => {
              const cfg = CATEGORY_CONFIG[cat];
              const Icon = cfg.icon;
              const active = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border transition-all",
                    active
                      ? cn(cfg.bg, cfg.text, cfg.border)
                      : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-500"
                  )}
                >
                  <Icon className="h-2.5 w-2.5" />
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Date range */}
          <div className="flex gap-1.5">
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-brand-500"
            />
            <span className="text-zinc-600 text-xs self-center">→</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Count bar */}
        <div className="flex-shrink-0 px-3 py-1.5 border-b border-zinc-800 text-xs text-zinc-500">
          {timelineLoading && timelineRows.length === 0
            ? "Loading…"
            : `${timelineTotal.toLocaleString()} event${timelineTotal !== 1 ? "s" : ""}`}
        </div>

        {/* Timeline feed */}
        <div className="flex-1 overflow-y-auto">
          {timelineRows.map(row => {
            const cfg = CATEGORY_CONFIG[row.event_category as Category];
            const Icon = cfg?.icon ?? User;
            const isSelected = selectedRowId === row.id;

            return (
              <button
                key={row.id}
                onClick={() => handleTimelineClick(row)}
                className={cn(
                  "w-full text-left flex items-start gap-2.5 px-3 py-2.5 border-b border-zinc-800/60 transition-colors",
                  isSelected
                    ? "bg-brand-500/10 border-l-2 border-l-brand-500"
                    : "hover:bg-zinc-800/40"
                )}
              >
                <div className={cn("flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mt-0.5", cfg?.bg ?? "bg-zinc-800")}>
                  <Icon className={cn("h-3 w-3", cfg?.text ?? "text-zinc-400")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={cn("text-xs font-mono font-medium", cfg?.text ?? "text-zinc-400")}>
                      {row.event_type}
                    </span>
                    <span className="text-[10px] text-zinc-600 flex-shrink-0">
                      {formatRelativeTime(row.created_at)}
                    </span>
                  </div>
                  {row.description && (
                    <p className="text-xs text-zinc-400 truncate">{row.description}</p>
                  )}
                  {row.actor_email && (
                    <p className="text-[10px] text-zinc-600 truncate">{row.actor_email}</p>
                  )}
                </div>
              </button>
            );
          })}

          {/* Load more */}
          {timelineRows.length < timelineTotal && (
            <div className="p-3 text-center">
              <button
                onClick={() => token && fetchTimeline(timelineOffsetRef.current, true, token, filters)}
                disabled={timelineLoading}
                className="text-xs text-brand-400 hover:text-brand-300 disabled:text-zinc-600 transition-colors"
              >
                {timelineLoading ? "Loading…" : `Load more (${(timelineTotal - timelineRows.length).toLocaleString()} remaining)`}
              </button>
            </div>
          )}

          {!timelineLoading && timelineRows.length === 0 && (
            <div className="p-6 text-center text-xs text-zinc-600">No events found</div>
          )}
        </div>
      </div>

      {/* ── Right pane: Table (60%) ───────────────────────────────── */}
      <div className="w-3/5 flex flex-col overflow-hidden">
        {/* Pagination bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
          <span className="text-xs text-zinc-500">
            {tableLoading ? "Loading…" : `${tableTotal.toLocaleString()} total • page ${tablePage}/${totalTablePages}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTablePage(p => Math.max(1, p - 1))}
              disabled={tablePage === 1 || tableLoading}
              className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
              disabled={tablePage === totalTablePages || tableLoading}
              className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-zinc-900 z-10">
              <tr className="border-b border-zinc-800">
                <th className="px-3 py-2 text-zinc-500 font-medium whitespace-nowrap">Time</th>
                <th className="px-3 py-2 text-zinc-500 font-medium whitespace-nowrap">Actor</th>
                <th className="px-3 py-2 text-zinc-500 font-medium whitespace-nowrap">Category</th>
                <th className="px-3 py-2 text-zinc-500 font-medium whitespace-nowrap">Event</th>
                <th className="px-3 py-2 text-zinc-500 font-medium whitespace-nowrap">Target</th>
                <th className="px-3 py-2 text-zinc-500 font-medium whitespace-nowrap">IP</th>
                <th className="px-3 py-2 text-zinc-500 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(row => {
                const isSelected = selectedRowId === row.id;
                const isExpanded = expandedRowId === row.id;
                const cfg = CATEGORY_CONFIG[row.event_category as Category];

                return (
                  <Fragment key={row.id}>
                    <tr
                      ref={el => {
                        if (el) rowRefsMap.current.set(row.id, el);
                        else rowRefsMap.current.delete(row.id);
                      }}
                      onClick={() => handleTableRowClick(row)}
                      className={cn(
                        "border-b border-zinc-800/60 cursor-pointer transition-colors",
                        isSelected ? "bg-brand-500/10" : "hover:bg-zinc-800/30"
                      )}
                    >
                      <td
                        className="px-3 py-2 text-zinc-500 whitespace-nowrap"
                        title={new Date(row.created_at).toLocaleString()}
                      >
                        {formatRelativeTime(row.created_at)}
                      </td>
                      <td className="px-3 py-2 text-zinc-300 max-w-[120px]">
                        <span className="truncate block" title={row.actor_email ?? undefined}>
                          {row.actor_email ?? <span className="text-zinc-600 italic">—</span>}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <CategoryBadge category={row.event_category} />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <code className={cn("text-xs font-mono", cfg?.text ?? "text-zinc-400")}>
                          {row.event_type}
                        </code>
                      </td>
                      <td className="px-3 py-2 text-zinc-500 whitespace-nowrap max-w-[100px]">
                        {row.target_type && row.target_id ? (
                          <span className="truncate block font-mono" title={`${row.target_type}:${row.target_id}`}>
                            {row.target_type}:{row.target_id.slice(0, 8)}…
                          </span>
                        ) : (
                          <span className="text-zinc-700">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-zinc-600 font-mono whitespace-nowrap">
                        {row.ip_address ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-zinc-400 max-w-[200px]">
                        <span className="truncate block" title={row.description ?? undefined}>
                          {row.description ?? <span className="text-zinc-700 italic">—</span>}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-zinc-950 border-b border-zinc-800">
                        <td colSpan={7} className="px-4 py-3">
                          {row.user_agent && (
                            <p className="text-[10px] text-zinc-500 mb-2 font-mono break-all">
                              <span className="text-zinc-600">UA: </span>{row.user_agent}
                            </p>
                          )}
                          <pre className="text-[10px] text-zinc-400 overflow-x-auto bg-zinc-900 rounded-lg p-2 border border-zinc-800">
                            {JSON.stringify(row.metadata, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {!tableLoading && tableRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-600 text-xs">
                    No events found
                  </td>
                </tr>
              )}

              {tableLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="h-5 w-5 border border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
