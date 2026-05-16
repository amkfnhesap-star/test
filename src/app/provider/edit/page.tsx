"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  getMyProviderProfile,
  updateProviderProfile,
  uploadPortfolioPhoto,
  type ProviderProfile,
} from "@/lib/providers";
import { ProviderProfileForm } from "@/components/provider/ProviderProfileForm";
import type { ProviderFormData } from "@/components/provider/ProviderProfileForm";
import toast from "react-hot-toast";

export default function EditProviderProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login?redirect=/provider/edit");
        return;
      }
      setUserId(session.user.id);

      const { profile, error } = await getMyProviderProfile();
      if (!profile || error) {
        router.replace("/provider/onboarding");
        return;
      }
      setProfile(profile);
      setLoading(false);
    });
  }, [router]);

  const handleSubmit = async (
    data: ProviderFormData,
    newPhotos: File[]
  ) => {
    if (!userId) return;
    setIsSubmitting(true);

    const uploadedUrls: string[] = [];
    for (let i = 0; i < newPhotos.length; i++) {
      const url = await uploadPortfolioPhoto(newPhotos[i], data.portfolio_urls.length + i);
      if (url) uploadedUrls.push(url);
    }

    const { error } = await updateProviderProfile({
      ...data,
      portfolio_urls: [...data.portfolio_urls, ...uploadedUrls],
    });

    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    toast.success("Profil actualizat!");
    // Fire-and-forget provider update log
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return;
      fetch("/api/log-activity", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "provider.updated",
          event_category: "provider",
          target_type: "provider",
          target_id: userId,
          description: `Provider profile updated: ${data.headline}`,
          metadata: { category: data.main_category, city: data.home_city, hourly_rate: data.hourly_rate ?? null },
        }),
      }).catch(() => {});
    });
    setIsSubmitting(false);

    const { profile: refreshed } = await getMyProviderProfile();
    if (refreshed) setProfile(refreshed);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard/my-jobs"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la panou
          </Link>
          {userId && (
            <Link
              href={`/pros/${userId}`}
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Vezi profilul public
            </Link>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Editează profilul de meșter
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Menține-ți profilul actualizat pentru a atrage mai mulți clienți.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 md:p-8"
        >
          <ProviderProfileForm
            initialData={{
              headline: profile?.headline,
              main_category: profile?.main_category,
              skills: profile?.skills,
              hourly_rate: profile?.hourly_rate,
              fixed_price_from: profile?.fixed_price_from,
              service_radius_km: profile?.service_radius_km,
              home_city: profile?.home_city,
              years_experience: profile?.years_experience,
              response_time: profile?.response_time ?? undefined,
              bio: profile?.bio,
              is_active: profile?.is_active,
            }}
            existingPortfolioUrls={profile?.portfolio_urls ?? []}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            showIsActive
            submitLabel="Salvează modificările"
          />
        </motion.div>
      </div>
    </div>
  );
}
