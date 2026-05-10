"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, MapPin, Clock, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { getFavoritedJobs, getFavoritedProviders } from "@/lib/favorites";
import { categories } from "@/data/dummy";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { Job } from "@/lib/jobs";
import type { ProviderProfile } from "@/lib/providers";

type Tab = "jobs" | "providers";

function timeframeLabel(t: string) {
  if (t === "asap") return "ASAP";
  if (t === "specific_date") return "Specific Date";
  return "Flexible";
}

function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs mx-auto">
        {description}
      </p>
      <Link href={cta.href}>
        <Button>{cta.label}</Button>
      </Link>
    </div>
  );
}

export default function FavoritesPage() {
  const [tab, setTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [jobsData, providersData] = await Promise.all([
        getFavoritedJobs(),
        getFavoritedProviders(),
      ]);
      setJobs(jobsData);
      setProviders(providersData);
      setLoading(false);
    };
    load();
  }, []);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "jobs", label: "Saved Jobs", count: jobs.length },
    { id: "providers", label: "Saved Providers", count: providers.length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Favorites
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Jobs and providers you&apos;ve saved
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t.id
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            {t.label}
            {!loading && t.count > 0 && (
              <span
                className={cn(
                  "h-5 min-w-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
                  tab === t.id
                    ? "bg-brand-500 text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 animate-pulse h-44"
            />
          ))}
        </div>
      ) : tab === "jobs" ? (
        jobs.length === 0 ? (
          <EmptyState
            icon="💼"
            title="No saved jobs yet"
            description="Browse open jobs and tap the heart icon to save ones you like."
            cta={{ label: "Browse Jobs", href: "/jobs" }}
          />
        ) : (
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
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                      <div className="flex items-center mb-3 pr-10">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            <span className="leading-none">{cat.icon}</span>
                            {cat.name}
                          </span>
                        ) : (
                          <span />
                        )}
                      </div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 line-clamp-2 text-sm leading-snug">
                        {job.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-4 flex-1 leading-relaxed">
                        {job.description}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800/60">
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeframeLabel(job.timeframe)}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">
                          {formatRelativeTime(job.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-4 right-4 z-10">
                    <FavoriteButton
                      targetType="job"
                      targetId={job.id}
                      onToggle={(fav) => {
                        if (!fav)
                          setJobs((prev) =>
                            prev.filter((j) => j.id !== job.id)
                          );
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      ) : providers.length === 0 ? (
        <EmptyState
          icon="👤"
          title="No saved providers yet"
          description="Browse professionals and tap the heart icon to save ones you'd like to hire."
          cta={{ label: "Browse Providers", href: "/pros" }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((pro, i) => {
            const cat = categories.find((c) => c.slug === pro.main_category);
            const name = pro.profiles?.full_name ?? "Provider";
            const avatarSrc = pro.profiles?.avatar_url ?? null;
            return (
              <motion.div
                key={pro.user_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="relative"
              >
                <Link href={`/pros/${pro.user_id}`} className="block h-full group">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 group-hover:shadow-md group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-all h-full flex flex-col">
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
                          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm truncate">
                            {name}
                          </h3>
                          {pro.is_verified && (
                            <Shield className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                        {cat && (
                          <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                            <span>{cat.icon}</span>
                            {cat.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2 flex-1">
                      {pro.headline}
                    </p>
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-50 dark:border-zinc-800">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {pro.home_city}
                      </span>
                      <div className="flex items-center gap-2">
                        {pro.average_rating > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="font-medium text-zinc-600 dark:text-zinc-300">
                              {pro.average_rating.toFixed(1)}
                            </span>
                          </span>
                        )}
                        {pro.hourly_rate != null && (
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {pro.hourly_rate} RON/hr
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="absolute top-4 right-4 z-10">
                  <FavoriteButton
                    targetType="provider"
                    targetId={pro.user_id}
                    onToggle={(fav) => {
                      if (!fav)
                        setProviders((prev) =>
                          prev.filter((p) => p.user_id !== pro.user_id)
                        );
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
