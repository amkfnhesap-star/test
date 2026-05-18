"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { ProviderReviews } from "@/components/reviews/ProviderReviews";
import { StarRating } from "@/components/reviews/StarRating";
import { TrustSignals } from "@/components/providers/TrustSignals";
import { getProviderProfile, type ProviderProfile } from "@/lib/providers";
import { supabase } from "@/lib/supabase";
import { categories } from "@/data/dummy";

function SelfGuardedContactButton({
  providerId,
  label,
  onClick,
  isLoading,
}: {
  providerId: string;
  label: string;
  onClick: () => void;
  isLoading: boolean;
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id ?? null);
    });
  }, []);

  if (currentUserId === undefined) return null;
  if (currentUserId === providerId) return null;

  return (
    <Button fullWidth size="lg" onClick={onClick} isLoading={isLoading} className="mb-5">
      {label}
    </Button>
  );
}

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id ?? null);
    });
  }, []);

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
      <div className="w-full min-h-screen flex items-center justify-center pt-16">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center pt-16 px-4 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Meșter negăsit
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          Acest profil nu există sau nu mai este activ.
        </p>
        <Link href="/pros">
          <Button>Descoperă meșteri</Button>
        </Link>
      </div>
    );
  }

  const cat = categories.find((c) => c.slug === profile.main_category);
  const name = profile.profiles?.full_name ?? "Provider";
  const avatarSrc = profile.profiles?.avatar_url ?? null;

  const handleContact = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/login?redirect=/pros/${id}`);
      return;
    }
    if (session.user.id === profile.user_id) return;

    setContacting(true);
    try {
      const r = await fetch("/api/conversations/start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otherUserId: profile.user_id,
          contextType: "provider",
          contextProviderId: profile.user_id,
        }),
      });
      const data = await r.json();
      if (data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      }
    } finally {
      setContacting(false);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen bg-slate-50 pt-16 pb-20 lg:pb-0">
        {/* Hero — light card */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-16">
            <Link
              href="/pros"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Descoperă meșteri
            </Link>

            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden ring-2 ring-brand-100 shadow-md">
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
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-100">
                        <span>{cat.icon}</span>
                        {cat.name}
                      </span>
                    )}
                    {profile.is_verified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200">
                        <CheckCircle className="h-3 w-3" />
                        Verificat
                      </span>
                    )}
                  </div>
                  <FavoriteButton
                    targetType="provider"
                    targetId={id}
                  />
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1 leading-tight">
                  {name}
                </h1>
                <p className="text-slate-700 text-base mb-4 leading-snug">
                  {profile.headline}
                </p>

                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 mb-3">
                  <StarRating
                    value={profile.average_rating}
                    count={profile.review_count}
                    size="md"
                  />
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.home_city}
                  </span>
                </div>
                <TrustSignals
                  provider={profile}
                  joinedAt={profile.created_at}
                  layout="stacked"
                />
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
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                >
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Competențe și specialități
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-700"
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
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                >
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Despre
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
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
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                >
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Portofoliu
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {profile.portfolio_urls.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxUrl(url)}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 hover:scale-[1.02] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
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

              {/* Reviews section */}
              <ProviderReviews
                providerId={profile.user_id}
                initialRating={profile.average_rating}
                initialCount={profile.review_count}
              />
            </div>

            {/* ── RIGHT: sticky sidebar ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-24">
                {/* Pricing */}
                <div className="mb-5 pb-5 border-b border-slate-200">
                  {profile.hourly_rate != null && (
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-bold text-slate-900">
                        {profile.hourly_rate.toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-sm">RON / oră</span>
                    </div>
                  )}
                  {profile.fixed_price_from != null && (
                    <p className="text-sm text-slate-500">
                      De la{" "}
                      <span className="font-semibold text-slate-800">
                        {profile.fixed_price_from.toLocaleString()} RON
                      </span>
                    </p>
                  )}
                </div>

                <SelfGuardedContactButton
                  providerId={profile.user_id}
                  label={`Contact ${name.split(" ")[0]}`}
                  onClick={handleContact}
                  isLoading={contacting}
                />

                {/* Details list */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">
                      Deservește până la{" "}
                      <span className="font-medium text-slate-800">
                        {profile.service_radius_km} km
                      </span>{" "}
                      în jurul{" "}
                      <span className="font-medium text-slate-800">
                        {profile.home_city}
                      </span>
                    </span>
                  </div>

                  {profile.response_time && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600">
                        Răspunde{" "}
                        <span className="font-medium text-slate-800">
                          {profile.response_time.toLowerCase()}
                        </span>
                      </span>
                    </div>
                  )}

                  {profile.years_experience != null && (
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600">
                        <span className="font-medium text-slate-800">
                          {profile.years_experience}{" "}
                          {profile.years_experience === 1 ? "an" : "ani"}
                        </span>{" "}
                        experiență
                      </span>
                    </div>
                  )}

                  {profile.review_count > 0 && (
                    <div className="flex items-center gap-3 text-sm">
                      <Star className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600">
                        <span className="font-medium text-slate-800">
                          {profile.average_rating.toFixed(1)} stele
                        </span>{" "}
                        · {profile.review_count} recenzii
                      </span>
                    </div>
                  )}

                  {profile.jobs_completed > 0 && (
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600">
                        <span className="font-medium text-slate-800">
                          {profile.jobs_completed}
                        </span>{" "}
                        lucrări finalizate
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky mobile contact CTA — shown below lg breakpoint when viewer isn't the provider */}
      {currentUserId !== profile.user_id && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 p-3 shadow-lg">
          <button
            onClick={handleContact}
            disabled={contacting}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-base transition-colors disabled:opacity-60"
          >
            {contacting ? "Se încarcă..." : `Contact ${name.split(" ")[0]}`}
          </button>
        </div>
      )}

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
