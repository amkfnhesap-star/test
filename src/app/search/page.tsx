"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { providers, categories } from "@/data/dummy";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const sortOptions = [
  { label: "Top Rated", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Reviews", value: "reviews" },
  { label: "Fastest Response", value: "response" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState("rating");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...providers];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.categories.some((c) => c.includes(q)) ||
          p.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter((p) =>
        p.categories.includes(selectedCategory)
      );
    }

    if (availableOnly) {
      result = result.filter((p) => p.is_available);
    }

    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    result = result.filter(
      (p) =>
        p.hourly_rate >= priceRange[0] && p.hourly_rate <= priceRange[1]
    );

    result.sort((a, b) => {
      switch (selectedSort) {
        case "rating": return b.rating - a.rating;
        case "price_asc": return a.hourly_rate - b.hourly_rate;
        case "price_desc": return b.hourly_rate - a.hourly_rate;
        case "reviews": return b.review_count - a.review_count;
        default: return 0;
      }
    });

    return result;
  }, [query, selectedCategory, availableOnly, minRating, priceRange, selectedSort]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-16">
      {/* Search header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="flex-1 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search services, providers, skills..."
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

            {/* Sort */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            </div>

            {/* View toggle */}
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

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors md:hidden"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Category pills */}
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
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.slug ? null : cat.slug
                  )
                }
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
          {/* Sidebar filters */}
          <aside className={cn(
            "w-64 flex-shrink-0",
            "hidden md:block",
          )}>
            <div className="sticky top-36 space-y-5">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h3>

                {/* Availability */}
                <div className="mb-5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      Available now only
                    </span>
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
                </div>

                {/* Min rating */}
                <div className="mb-5">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Minimum Rating
                  </p>
                  <div className="flex gap-2">
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
                        {r === 0 ? "Any" : `${r}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Max Hourly Rate:{" "}
                    <span className="text-brand-500">${priceRange[1]}</span>
                  </p>
                  <input
                    type="range"
                    min={20}
                    max={300}
                    step={10}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], +e.target.value])
                    }
                    className="w-full accent-brand-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-400 mt-1">
                    <span>$20</span>
                    <span>$300+</span>
                  </div>
                </div>
              </div>

              {/* AI suggestion box */}
              <div className="bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20 rounded-2xl border border-brand-100 dark:border-brand-800/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-brand-500" />
                  <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                    AI Suggestion
                  </span>
                </div>
                <p className="text-xs text-brand-600 dark:text-brand-400 leading-relaxed mb-3">
                  Based on your search, we recommend filtering by{" "}
                  <strong>4.8+ rating</strong> and enabling{" "}
                  <strong>available now</strong> for best results.
                </p>
                <button
                  onClick={() => { setMinRating(4.8); setAvailableOnly(true); }}
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Apply suggestion →
                </button>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {filtered.length}
                </span>{" "}
                professionals found
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  No providers found
                </h3>
                <p className="text-zinc-400 text-sm">
                  Try adjusting your filters or search term.
                </p>
              </div>
            ) : (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-3"
                )}
              >
                {filtered.map((provider, i) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/providers/${provider.id}`}>
                      <div
                        className={cn(
                          "group rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg hover:border-transparent hover:-translate-y-0.5 transition-all duration-300 overflow-hidden",
                          viewMode === "list" && "flex gap-4 p-4"
                        )}
                      >
                        {viewMode === "grid" ? (
                          <>
                            {/* Grid card */}
                            <div className="p-5">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="relative flex-shrink-0">
                                  <Image
                                    src={provider.avatar_url}
                                    alt={provider.full_name}
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 rounded-xl object-cover"
                                  />
                                  {provider.is_available && (
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                                    {provider.full_name}
                                  </h3>
                                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                                    {provider.tagline}
                                  </p>
                                </div>
                                {provider.verification_status === "verified" && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1 mb-3">
                                {provider.categories.slice(0, 2).map((c) => {
                                  const cat = categories.find((cat) => cat.id === c);
                                  return (
                                    <span
                                      key={c}
                                      className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px]"
                                    >
                                      {cat?.icon} {cat?.name ?? c}
                                    </span>
                                  );
                                })}
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3 text-zinc-500">
                                  <div className="flex items-center gap-0.5">
                                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                      {provider.rating}
                                    </span>
                                    <span className="text-zinc-400">({provider.review_count})</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {provider.city}
                                  </div>
                                </div>
                                <div className="font-bold text-zinc-900 dark:text-white">
                                  {formatCurrency(provider.hourly_rate)}
                                  <span className="text-xs font-normal text-zinc-400">/hr</span>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* List card */}
                            <Image
                              src={provider.avatar_url}
                              alt={provider.full_name}
                              width={56}
                              height={56}
                              className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-brand-600 transition-colors">
                                    {provider.full_name}
                                  </h3>
                                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                                    {provider.bio}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="font-bold text-zinc-900 dark:text-white text-sm">
                                    {formatCurrency(provider.hourly_rate)}/hr
                                  </div>
                                  <div className="flex items-center gap-1 mt-0.5 justify-end">
                                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                      {provider.rating} ({provider.review_count})
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {provider.city}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {provider.response_time}
                                </span>
                                {provider.is_available && (
                                  <Badge variant="success" dot className="text-[10px]">Available</Badge>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
