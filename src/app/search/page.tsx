"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Clock,
  Filter,
  X,
  ChevronDown,
  Sparkles,
  Grid2X2,
  List,
  CheckCircle2,
  Briefcase,
  Camera,
} from "lucide-react";
import { getProviders, type ProviderProfile } from "@/lib/providers";
import { getJobs, type Job } from "@/lib/jobs";
import { categories } from "@/data/dummy";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";

type FeedItem =
  | { kind: "provider"; data: ProviderProfile }
  | { kind: "job"; data: Job };

const SORT_OPTIONS = [
  { label: "Cea mai bună potrivire", value: "best_match" },
  { label: "Cele mai recente", value: "newest" },
  { label: "Cel mai bine cotate", value: "top_rated" },
  { label: "Preț crescător", value: "price_asc" },
  { label: "Preț descrescător", value: "price_desc" },
];

const TIMEFRAME_OPTIONS = [
  { label: "Oricând", value: "" },
  { label: "Urgent", value: "asap" },
  { label: "Dată specifică", value: "specific_date" },
  { label: "Flexibil", value: "flexible" },
];

const PAGE_SIZE = 12;
const MAX_RATE = 300;
const MAX_BUDGET = 10000;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "chiar acum";
  if (mins < 60) return `acum ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `acum ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `acum ${days}z`;
  return `acum ${Math.floor(days / 30)}l`;
}

function interleave(providers: ProviderProfile[], jobs: Job[]): FeedItem[] {
  const result: FeedItem[] = [];
  const len = Math.max(providers.length, jobs.length);
  for (let i = 0; i < len; i++) {
    if (i < providers.length) result.push({ kind: "provider", data: providers[i] });
    if (i < jobs.length) result.push({ kind: "job", data: jobs[i] });
  }
  return result;
}

function SearchContent() {
  const searchParams = useSearchParams();

  const [allProviders, setAllProviders] = useState<ProviderProfile[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // "?type=providers" or "?type=jobs" from URL locks the feed to one type
  const forceType = (searchParams.get("type") ?? "") as "" | "providers" | "jobs";

  // Universal filters
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category")
  );
  const [cityFilter, setCityFilter] = useState("");

  // Sort + view
  const [selectedSort, setSelectedSort] = useState("best_match");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Provider-only filters
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxRate, setMaxRate] = useState(MAX_RATE);

  // Job-only filters
  const [maxBudget, setMaxBudget] = useState(MAX_BUDGET);
  const [timeframeFilter, setTimeframeFilter] = useState("");
  const [hasPhotos, setHasPhotos] = useState(false);

  // Pagination
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDisplayCount(PAGE_SIZE);

    Promise.all([
      getProviders({ category: selectedCategory || undefined, pageSize: 100 }),
      getJobs({ category: selectedCategory || undefined, pageSize: 100 }),
    ]).then(([{ providers }, { jobs }]) => {
      if (cancelled) return;
      setAllProviders(providers);
      setAllJobs(jobs);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [selectedCategory]);

  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [query, cityFilter, selectedSort, availableOnly, minRating, maxRate, maxBudget, timeframeFilter, hasPhotos]);

  const providerOnlyActive = availableOnly || minRating > 0 || maxRate < MAX_RATE;
  const jobOnlyActive = maxBudget < MAX_BUDGET || timeframeFilter !== "" || hasPhotos;

  const filtered = useMemo<FeedItem[]>(() => {
    const pOnly = availableOnly || minRating > 0 || maxRate < MAX_RATE;
    const jOnly = maxBudget < MAX_BUDGET || timeframeFilter !== "" || hasPhotos;

    let filteredProviders: ProviderProfile[] = [];
    if (!jOnly && forceType !== "jobs") {
      filteredProviders = allProviders.filter((p) => {
        if (query) {
          const q = query.toLowerCase();
          if (
            !(
              (p.profiles?.full_name ?? "").toLowerCase().includes(q) ||
              p.headline.toLowerCase().includes(q) ||
              p.main_category.toLowerCase().includes(q) ||
              p.skills.some((s) => s.toLowerCase().includes(q))
            )
          ) return false;
        }
        if (cityFilter && !p.home_city.toLowerCase().includes(cityFilter.toLowerCase())) return false;
        if (minRating > 0 && p.average_rating < minRating) return false;
        if (maxRate < MAX_RATE && (p.hourly_rate ?? 0) > maxRate) return false;
        return true;
      });
    }

    let filteredJobs: Job[] = [];
    if (!pOnly && forceType !== "providers") {
      filteredJobs = allJobs.filter((j) => {
        if (query) {
          const q = query.toLowerCase();
          if (
            !(
              j.title.toLowerCase().includes(q) ||
              j.description.toLowerCase().includes(q) ||
              j.city.toLowerCase().includes(q)
            )
          ) return false;
        }
        if (cityFilter && !j.city.toLowerCase().includes(cityFilter.toLowerCase())) return false;
        if (maxBudget < MAX_BUDGET && j.budget !== null && j.budget > maxBudget) return false;
        if (timeframeFilter && j.timeframe !== timeframeFilter) return false;
        if (hasPhotos && j.photo_urls.length === 0) return false;
        return true;
      });
    }

    switch (selectedSort) {
      case "top_rated":
        filteredProviders.sort((a, b) => b.average_rating - a.average_rating);
        filteredJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "price_asc":
        filteredProviders.sort((a, b) => (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0));
        filteredJobs.sort((a, b) => (a.budget ?? 0) - (b.budget ?? 0));
        break;
      case "price_desc":
        filteredProviders.sort((a, b) => (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0));
        filteredJobs.sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0));
        break;
      default:
        filteredProviders.sort((a, b) => b.average_rating - a.average_rating);
        filteredJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    if (selectedSort === "newest") {
      const all: FeedItem[] = [
        ...filteredProviders.map((p): FeedItem => ({ kind: "provider", data: p })),
        ...filteredJobs.map((j): FeedItem => ({ kind: "job", data: j })),
      ];
      return all.sort((a, b) =>
        new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime()
      );
    }

    return interleave(filteredProviders, filteredJobs);
  }, [allProviders, allJobs, query, cityFilter, selectedSort, availableOnly, minRating, maxRate, maxBudget, timeframeFilter, hasPhotos, forceType]);

  const displayItems = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-16">
      {/* Sticky search header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <Search className="h-4 w-4 text-zinc-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Caută lucrări, meșteri, competențe..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X className="h-4 w-4 text-zinc-400 hover:text-zinc-600" />
                </button>
              )}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-900/30">
                <Sparkles className="h-3 w-3 text-brand-600 dark:text-brand-400" />
                <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">AI</span>
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white"
                    : "text-zinc-400"
                )}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white"
                    : "text-zinc-400"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-colors md:hidden"
            >
              <Filter className="h-4 w-4" />
              Filtre
            </button>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                !selectedCategory
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              Toate categoriile
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedCategory === cat.slug
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                )}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={cn("w-64 flex-shrink-0", showFilters ? "block" : "hidden md:block")}>
            <div className="sticky top-36 space-y-5">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-5">
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtre
                </h3>

                {/* City — universal */}
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Oraș
                  </p>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-200 dark:border-zinc-700 focus-within:border-brand-500 transition-all">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="ex. București"
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                    />
                    {cityFilter && (
                      <button onClick={() => setCityFilter("")}>
                        <X className="h-3 w-3 text-zinc-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Provider-only filters */}
                <div className={cn("space-y-4 transition-opacity duration-200", jobOnlyActive && "opacity-40 pointer-events-none")}>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 inline-block" />
                    Filtre meșteri
                  </p>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Doar disponibili acum</span>
                    <button
                      onClick={() => setAvailableOnly(!availableOnly)}
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors",
                        availableOnly ? "bg-brand-500" : "bg-zinc-200 dark:bg-zinc-700"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                          availableOnly ? "left-[18px]" : "left-0.5"
                        )}
                      />
                    </button>
                  </label>

                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Evaluare minimă</p>
                    <div className="flex gap-1.5">
                      {[0, 4, 4.5, 4.8].map((r) => (
                        <button
                          key={r}
                          onClick={() => setMinRating(r)}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                            minRating === r
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          )}
                        >
                          {r === 0 ? "Orice" : `${r}+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Tarif maxim:{" "}
                      <span className="text-brand-500">
                        {maxRate >= MAX_RATE ? "Orice" : `${maxRate} RON/oră`}
                      </span>
                    </p>
                    <input
                      type="range" min={20} max={MAX_RATE} step={10}
                      value={maxRate}
                      onChange={(e) => setMaxRate(+e.target.value)}
                      className="w-full accent-brand-500"
                    />
                    <div className="flex justify-between text-xs text-zinc-400 mt-1">
                      <span>20 RON</span>
                      <span>300+ RON</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800" />

                {/* Job-only filters */}
                <div className={cn("space-y-4 transition-opacity duration-200", providerOnlyActive && "opacity-40 pointer-events-none")}>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 inline-block" />
                    Filtre lucrări
                  </p>

                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Buget maxim:{" "}
                      <span className="text-cyan-600 dark:text-cyan-400">
                        {maxBudget >= MAX_BUDGET ? "Orice" : `${maxBudget} RON`}
                      </span>
                    </p>
                    <input
                      type="range" min={100} max={MAX_BUDGET} step={100}
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(+e.target.value)}
                      className="w-full accent-cyan-500"
                    />
                    <div className="flex justify-between text-xs text-zinc-400 mt-1">
                      <span>100 RON</span>
                      <span>10k+ RON</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Perioadă</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {TIMEFRAME_OPTIONS.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTimeframeFilter(t.value)}
                          className={cn(
                            "py-1.5 rounded-lg text-xs font-medium transition-all",
                            timeframeFilter === t.value
                              ? "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-700"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Cu fotografii</span>
                    <button
                      onClick={() => setHasPhotos(!hasPhotos)}
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors",
                        hasPhotos ? "bg-cyan-500" : "bg-zinc-200 dark:bg-zinc-700"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                          hasPhotos ? "left-[18px]" : "left-0.5"
                        )}
                      />
                    </button>
                  </label>
                </div>
              </div>

              {/* AI suggestion */}
              <div className="bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20 rounded-2xl border border-brand-100 dark:border-brand-800/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-brand-500" />
                  <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">Sugestie AI</span>
                </div>
                <p className="text-xs text-brand-600 dark:text-brand-400 leading-relaxed mb-3">
                  Pe baza căutării tale, recomandăm filtrarea după{" "}
                  <strong>evaluare 4.8+</strong> și activarea{" "}
                  <strong>doar disponibili</strong> pentru cele mai bune rezultate.
                </p>
                <button
                  onClick={() => { setMinRating(4.8); setAvailableOnly(true); }}
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Aplică sugestia →
                </button>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {loading ? "—" : filtered.length}
                </span>{" "}
                rezultate găsite
              </p>
                {!loading && forceType === "providers" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
                  Doar meșteri —{" "}
                  <Link href="/search" className="underline">Toate</Link>
                </span>
              )}
              {!loading && forceType === "jobs" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                  Doar lucrări —{" "}
                  <Link href="/search" className="underline">Toate</Link>
                </span>
              )}
              {!loading && !forceType && (providerOnlyActive || jobOnlyActive) && (
                <p className="text-xs text-zinc-400 italic">
                  {providerOnlyActive
                    ? "Filtre meșteri active — lucrările sunt ascunse"
                    : "Filtre lucrări active — meșterii sunt ascuși"}
                </p>
              )}
            </div>

            {loading ? (
              <div className={cn(
                viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"
              )}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded mb-2" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Niciun rezultat găsit
                </h3>
                <p className="text-zinc-400 text-sm">
                  Încearcă să ajustezi filtrele sau termenul de căutare.
                </p>
              </div>
            ) : (
              <>
                <div className={cn(
                  viewMode === "grid"
                    ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-3"
                )}>
                  {displayItems.map((item, i) =>
                    item.kind === "provider" ? (
                      <ProviderCard
                        key={`p-${item.data.user_id}`}
                        provider={item.data}
                        viewMode={viewMode}
                        index={i}
                      />
                    ) : (
                      <JobCard
                        key={`j-${item.data.id}`}
                        job={item.data}
                        viewMode={viewMode}
                        index={i}
                      />
                    )
                  )}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setDisplayCount((c) => c + PAGE_SIZE)}
                      className="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Încarcă încă {Math.min(PAGE_SIZE, filtered.length - displayCount)}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

// ── Provider Card ────────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  viewMode,
  index,
}: {
  provider: ProviderProfile;
  viewMode: "grid" | "list";
  index: number;
}) {
  const name = provider.profiles?.full_name ?? "Provider";
  const avatarSrc = provider.profiles?.avatar_url ?? null;
  const cat = categories.find((c) => c.slug === provider.main_category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04 }}
      className="relative"
    >
      <Link href={`/pros/${provider.user_id}`}>
        <div
          className={cn(
            "group relative rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg hover:border-transparent hover:-translate-y-0.5 transition-all duration-300 overflow-hidden",
            viewMode === "list" && "flex gap-4 p-4"
          )}
        >
          {viewMode === "grid" && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700/50">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 inline-block" />
                Meșter
              </span>
            </div>
          )}

          {viewMode === "grid" ? (
            <div className="p-5 pt-8">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0">
                  {avatarSrc ? (
                    <Image src={avatarSrc} alt={name} width={48} height={48} className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <Avatar name={name} size="md" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                    {name}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{provider.headline}</p>
                </div>
                {provider.is_verified && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                )}
              </div>

              {cat && (
                <div className="mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px]">
                    {cat.icon} {cat.name}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-zinc-500">
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {provider.average_rating.toFixed(1)}
                    </span>
                    <span className="text-zinc-400">({provider.review_count})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {provider.home_city}
                  </div>
                </div>
                {provider.hourly_rate != null && (
                  <div className="font-bold text-zinc-900 dark:text-white">
                    {provider.hourly_rate}
                    <span className="text-xs font-normal text-zinc-400"> RON/oră</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {avatarSrc ? (
                <Image src={avatarSrc} alt={name} width={56} height={56} className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="flex-shrink-0"><Avatar name={name} size="lg" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-brand-600 transition-colors truncate">
                        {name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700/50 flex-shrink-0">
                        Provider
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{provider.bio}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {provider.hourly_rate != null && (
                      <div className="font-bold text-zinc-900 dark:text-white text-sm">
                        {provider.hourly_rate} RON/oră
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-0.5 justify-end">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {provider.average_rating.toFixed(1)} ({provider.review_count})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {provider.home_city}
                  </span>
                  {provider.response_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {provider.response_time}
                    </span>
                  )}
                  {provider.is_verified && (
                    <Badge variant="success" dot className="text-[10px]">Verificat</Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Link>
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton targetType="provider" targetId={provider.user_id} />
      </div>
    </motion.div>
  );
}

// ── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({
  job,
  viewMode,
  index,
}: {
  job: Job;
  viewMode: "grid" | "list";
  index: number;
}) {
  const cat = categories.find((c) => c.slug === job.category);

  const timeframeLabel =
    job.timeframe === "asap"
      ? "Urgent"
      : job.timeframe === "specific_date" && job.scheduled_date
      ? new Date(job.scheduled_date).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })
      : job.timeframe === "flexible"
      ? "Flexibil"
      : job.timeframe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04 }}
      className="relative"
    >
      <Link href={`/jobs/${job.id}`}>
        <div
          className={cn(
            "group relative rounded-2xl border border-cyan-100 dark:border-cyan-900/40 bg-white dark:bg-zinc-900 hover:shadow-lg hover:border-transparent hover:-translate-y-0.5 transition-all duration-300 overflow-hidden",
            viewMode === "list" && "flex gap-4 p-4"
          )}
        >
          {viewMode === "grid" && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700/50">
                <Briefcase className="h-2.5 w-2.5" />
                Job
              </span>
            </div>
          )}

          {viewMode === "grid" ? (
            <div className="p-5 pt-8">
              <div className="mb-2">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug flex-1">
                    {job.title}
                  </h3>
                  <JobStatusBadge status={job.status} />
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
              </div>

              {cat && (
                <div className="mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px]">
                    {cat.icon} {cat.name}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-zinc-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.city}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeframeLabel}
                  </div>
                </div>
                {job.budget != null ? (
                  <div className="font-bold text-cyan-700 dark:text-cyan-400">
                    {job.budget}
                    <span className="text-xs font-normal text-zinc-400"> RON</span>
                  </div>
                ) : (
                  <span className="text-zinc-400 text-[10px]">Buget deschis</span>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-zinc-50 dark:border-zinc-800 text-[10px] text-zinc-400 flex items-center gap-2">
                <span>Postat {timeAgo(job.created_at)}</span>
                {job.photo_urls.length > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Camera className="h-2.5 w-2.5" />
                    {job.photo_urls.length} foto
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/30 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-cyan-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-cyan-600 transition-colors truncate">
                        {job.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700/50 flex-shrink-0">
                        <Briefcase className="h-2.5 w-2.5" />
                        Job
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {job.budget != null ? (
                      <div className="font-bold text-cyan-700 dark:text-cyan-400 text-sm">
                        {job.budget} RON
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-xs">Open budget</span>
                    )}
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {timeAgo(job.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeframeLabel}
                  </span>
                  {cat && <span>{cat.icon} {cat.name}</span>}
                </div>
              </div>
            </>
          )}
        </div>
      </Link>
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton targetType="job" targetId={job.id} />
      </div>
    </motion.div>
  );
}
