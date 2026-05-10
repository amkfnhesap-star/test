"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Star,
  Briefcase,
  Shield,
  ChevronLeft,
  X,
  CheckCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { getProviderProfile, type ProviderProfile } from "@/lib/providers";
import { categories } from "@/data/dummy";

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProviderProfile(id).then(({ profile, error }) => {
      if (error || !profile || !profile.is_active) {
        setNotFound(true);
      } else {
        setProfile(profile);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 px-4 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Provider not found
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
          This profile doesn't exist or is no longer active.
        </p>
        <Link href="/pros">
          <Button>Browse providers</Button>
        </Link>
      </div>
    );
  }

  const cat = categories.find((c) => c.slug === profile.main_category);
  const name = profile.profiles?.full_name ?? "Provider";
  const avatarSrc = profile.profiles?.avatar_url ?? null;

  const handleContact = () => {
    const phone = profile.profiles?.phone;
    if (phone) {
      alert(`Contact ${name} at: ${phone}`);
    } else {
      alert("Messaging is coming soon! Check back later.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-16">
        {/* Hero banner */}
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-violet-600 overflow-hidden">
          {/* subtle texture overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-20">
            <Link
              href="/pros"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-8 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Browse providers
            </Link>

            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-4 border-white/25 shadow-2xl">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Avatar name={name} size="2xl" />
                  )}
                </div>
                {profile.is_verified && (
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Name + headline + stats */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {cat && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-medium border border-white/20">
                        <span>{cat.icon}</span>
                        {cat.name}
                      </span>
                    )}
                    {profile.is_verified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-medium border border-emerald-400/20">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <FavoriteButton
                    targetType="provider"
                    targetId={id}
                    className="bg-white/15 border-white/25 text-white hover:bg-white/25 hover:border-white/40"
                  />
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1 leading-tight">
                  {name}
                </h1>
                <p className="text-white/75 text-base mb-4 leading-snug">
                  {profile.headline}
                </p>

                <div className="flex flex-wrap items-center gap-5 text-sm text-white/65">
                  {profile.average_rating > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-white font-semibold">
                        {profile.average_rating.toFixed(1)}
                      </span>
                      <span>({profile.review_count} reviews)</span>
                    </span>
                  )}
                  {profile.jobs_completed > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {profile.jobs_completed} jobs completed
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.home_city}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content — pulled up to overlap the hero bottom */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ── LEFT: main content ── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Skills */}
              {profile.skills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6"
                >
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                    Skills & Specialties
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Bio */}
              {profile.bio && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6"
                >
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                    About
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                    {profile.bio}
                  </p>
                </motion.div>
              )}

              {/* Portfolio gallery */}
              {profile.portfolio_urls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6"
                >
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                    Portfolio
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {profile.portfolio_urls.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxUrl(url)}
                        className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:opacity-90 hover:scale-[1.02] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <Image
                          src={url}
                          alt={`Portfolio photo ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── RIGHT: sticky sidebar ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 lg:sticky lg:top-24">
                {/* Pricing */}
                <div className="mb-5 pb-5 border-b border-zinc-100 dark:border-zinc-800">
                  {profile.hourly_rate != null && (
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                        {profile.hourly_rate.toLocaleString()}
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400 text-sm">RON / hr</span>
                    </div>
                  )}
                  {profile.fixed_price_from != null && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Starting from{" "}
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {profile.fixed_price_from.toLocaleString()} RON
                      </span>
                    </p>
                  )}
                </div>

                <Button fullWidth size="lg" onClick={handleContact} className="mb-5">
                  Contact {name.split(" ")[0]}
                </Button>

                {/* Details list */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Serves up to{" "}
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {profile.service_radius_km} km
                      </span>{" "}
                      around{" "}
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {profile.home_city}
                      </span>
                    </span>
                  </div>

                  {profile.response_time && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Responds{" "}
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {profile.response_time.toLowerCase()}
                        </span>
                      </span>
                    </div>
                  )}

                  {profile.years_experience != null && (
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                      <span className="text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {profile.years_experience} year
                          {profile.years_experience !== 1 ? "s" : ""}
                        </span>{" "}
                        of experience
                      </span>
                    </div>
                  )}

                  {profile.review_count > 0 && (
                    <div className="flex items-center gap-3 text-sm">
                      <Star className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                      <span className="text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {profile.average_rating.toFixed(1)} stars
                        </span>{" "}
                        · {profile.review_count} reviews
                      </span>
                    </div>
                  )}

                  {profile.jobs_completed > 0 && (
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                      <span className="text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {profile.jobs_completed}
                        </span>{" "}
                        jobs completed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <button
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={() => setLightboxUrl(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="max-w-3xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxUrl}
                alt="Portfolio photo"
                width={900}
                height={650}
                className="w-full h-full max-h-[85vh] object-contain rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
