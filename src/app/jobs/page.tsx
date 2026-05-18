"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { getJobs, type Job } from "@/lib/jobs";
import { supabase } from "@/lib/supabase";
import { categories } from "@/data/dummy";
import { formatRelativeTime, cn } from "@/lib/utils";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";

const PAGE_SIZE = 12;

function timeframeLabel(t: string) {
  if (t === "asap") return "Urgent";
  if (t === "specific_date") return "Dată specifică";
  return "Flexibil";
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-3.5 bg-slate-100 rounded-full w-24" />
        <div className="h-3.5 bg-slate-100 rounded-full w-16" />
      </div>
      <div className="h-5 bg-slate-100 rounded w-3/4 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-full mb-1" />
      <div className="h-4 bg-slate-100 rounded w-2/3 mb-5" />
      <div className="flex gap-3 pt-3 border-t border-slate-100">
        <div className="h-3 bg-slate-100 rounded w-20" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [cityInput, setCityInput] = useState("");

  const fetchJobs = useCallback(
    async (cat: string, city: string, pg: number, append: boolean) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const { jobs: fetched, hasMore: more } = await getJobs({
        category: cat || undefined,
        city: city || undefined,
        page: pg,
        pageSize: PAGE_SIZE,
      });

      setJobs((prev) => (append ? [...prev, ...fetched] : fetched));
      setHasMore(more);
      setLoading(false);
      setLoadingMore(false);
    },
    []
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    setPage(0);
    fetchJobs(categoryFilter, cityFilter, 0, false);
  }, [categoryFilter, cityFilter, fetchJobs]);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCityFilter(cityInput);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchJobs(categoryFilter, cityFilter, next, true);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Lucrări disponibile
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Explorează cererile clienților — găsește lucrări care ți se potrivesc.
            </p>
          </div>
          <Link href="/jobs/new">
            <Button size="md" leftIcon={<Plus className="h-4 w-4" />}>
              Postează o lucrare
            </Button>
          </Link>
        </div>

        {/* City search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleCitySearch} className="flex gap-2 flex-1">
            <Input
              placeholder="Filtrează după oraș..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              fullWidth
            />
            <Button type="submit" variant="secondary" size="md">
              Caută
            </Button>
          </form>
          {cityFilter && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setCityFilter("");
                setCityInput("");
              }}
            >
              Șterge
            </Button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setCategoryFilter("")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              !categoryFilter
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            Toate
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setCategoryFilter(
                  cat.slug === categoryFilter ? "" : cat.slug
                )
              }
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                categoryFilter === cat.slug
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <span className="leading-none">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg mb-1">Nicio lucrare disponibilă</p>
            <p className="text-slate-400 text-sm mb-6">
              {categoryFilter || cityFilter
                ? "Încearcă să ștergi filtrele."
                : "Fii primul care postează una!"}
            </p>
            <Link href="/jobs/new">
              <Button>Postează o lucrare</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job, i) => {
                const cat = categories.find((c) => c.slug === job.category);
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="relative"
                  >
                    <Link href={`/jobs/${job.id}`} className="block h-full">
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                        {/* Category */}
                        <div className="flex items-center mb-3 pr-10">
                          {cat ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <span className="leading-none">{cat.icon}</span>
                              {cat.name}
                            </span>
                          ) : (
                            <span />
                          )}
                        </div>

                        {/* Title + status */}
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm leading-snug flex-1">
                            {job.title}
                          </h3>
                          <JobStatusBadge status={job.status} />
                        </div>

                        {/* Description excerpt */}
                        <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeframeLabel(job.timeframe)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{formatRelativeTime(job.created_at)}</span>
                            {job.budget && (
                              <span className="font-semibold text-sm text-slate-900">
                                {job.budget.toLocaleString()} RON
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    {job.client_id !== currentUserId && (
                      <div className="absolute top-4 right-4 z-10">
                        <FavoriteButton targetType="job" targetId={job.id} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {hasMore && (
              <div className="text-center mt-10">
                <Button
                  variant="secondary"
                  size="lg"
                  isLoading={loadingMore}
                  onClick={handleLoadMore}
                >
                  Încarcă mai multe lucrări
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
