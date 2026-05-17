"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, MapPin, Shield, CheckCircle2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { StarRating } from "@/components/reviews/StarRating";
import { TrustSignals } from "@/components/providers/TrustSignals";
import { getProviders, type ProviderProfile } from "@/lib/providers";
import { categories } from "@/data/dummy";
import { cn } from "@/lib/utils";

type SortOption = "rating" | "newest" | "alphabetical";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-xl bg-slate-100 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-slate-100 rounded mb-2" />
      <div className="h-3 bg-slate-100 rounded w-3/4" />
    </div>
  );
}

export default function BrowseProvidersPage() {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pageNum, setPageNum] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("rating");

  const filtersRef = useRef({ selectedCategory, cityFilter, sort });
  filtersRef.current = { selectedCategory, cityFilter, sort };

  const fetchProviders = async (options: { reset: boolean; page: number }) => {
    if (options.reset) setLoading(true);
    else setLoadingMore(true);

    const { providers: data, hasMore: more } = await getProviders({
      category: filtersRef.current.selectedCategory || undefined,
      city: filtersRef.current.cityFilter || undefined,
      sort: filtersRef.current.sort,
      page: options.page,
    });

    if (options.reset) {
      setProviders(data);
      setPageNum(1);
    } else {
      setProviders((prev) => [...prev, ...data]);
      setPageNum((p) => p + 1);
    }
    setHasMore(more);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchProviders({ reset: true, page: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, cityFilter, sort]);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCityFilter(cityInput);
  };

  const clearCity = () => {
    setCityFilter("");
    setCityInput("");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Descoperă meșteri
          </h1>
          <p className="text-slate-500 text-sm">
            Angajează meșteri calificați pentru orice lucrare — de la curățenie la automatizare AI.
          </p>
        </div>

        {/* Filter panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 space-y-5 shadow-sm">
          {/* City search */}
          <form onSubmit={handleCitySearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrează după oraș..."
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
            <Button type="submit" variant="secondary" size="md">
              Caută
            </Button>
            {cityFilter && (
              <Button type="button" variant="ghost" size="md" onClick={clearCity}>
                Șterge
              </Button>
            )}
          </form>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory("")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-sm font-medium transition-all border",
                !selectedCategory
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
                  setSelectedCategory(selectedCategory === cat.slug ? "" : cat.slug)
                }
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border",
                  selectedCategory === cat.slug
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Sortare:</span>
            {(
              [
                { value: "rating", label: "Cel mai bine cotate" },
                { value: "newest", label: "Cele mai recente" },
                { value: "alphabetical", label: "A–Z" },
              ] as { value: SortOption; label: string }[]
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSort(value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  sort === value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Niciun meșter găsit
            </h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Încearcă o altă categorie sau oraș, sau revino mai târziu.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((pro, i) => {
                const cat = categories.find((c) => c.slug === pro.main_category);
                const name = pro.profiles?.full_name ?? "Provider";
                const avatarSrc = pro.profiles?.avatar_url ?? null;

                return (
                  <motion.div
                    key={pro.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="relative"
                  >
                    <Link href={`/pros/${pro.user_id}`} className="block h-full group">
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 group-hover:shadow-md group-hover:border-brand-200 group-hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                        {/* Avatar + name + verified badge */}
                        <div className="flex items-start gap-3 mb-3 pr-10">
                          <div className="flex-shrink-0">
                            {avatarSrc ? (
                              <div className="h-12 w-12 rounded-xl overflow-hidden">
                                <Image
                                  src={avatarSrc}
                                  alt={name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <Avatar name={name} size="md" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-brand-600 transition-colors truncate">
                                {name}
                              </h3>
                              {pro.is_verified && (
                                <span title="Meșter verificat">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                </span>
                              )}
                            </div>
                            {cat && (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                <span>{cat.icon}</span>
                                {cat.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Headline */}
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-1">
                          {pro.headline}
                        </p>

                        {/* Skills */}
                        {pro.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {pro.skills.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-md bg-brand-50 text-[11px] text-brand-700 border border-brand-100"
                              >
                                {s}
                              </span>
                            ))}
                            {pro.skills.length > 3 && (
                              <span className="text-[11px] text-slate-400 self-center">
                                +{pro.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Trust signals */}
                        <TrustSignals
                          provider={pro}
                          joinedAt={pro.created_at}
                          layout="inline"
                          className="mb-3"
                        />

                        {/* Bottom row: city, rating, price */}
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {pro.home_city}
                          </span>
                          <div className="flex items-center gap-2">
                            <StarRating
                              value={pro.average_rating}
                              count={pro.review_count}
                              size="sm"
                            />
                            {pro.hourly_rate != null && (
                              <span className="font-semibold text-slate-700">
                                {pro.hourly_rate} RON/oră
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="absolute top-4 right-4 z-10">
                      <FavoriteButton targetType="provider" targetId={pro.user_id} />
                    </div>
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
                  onClick={() => fetchProviders({ reset: false, page: pageNum })}
                >
                  Încarcă mai mulți meșteri
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
