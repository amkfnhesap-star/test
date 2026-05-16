"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  createProviderProfile,
  getMyProviderProfile,
  uploadPortfolioPhoto,
} from "@/lib/providers";
import { ProviderProfileForm } from "@/components/provider/ProviderProfileForm";
import type { ProviderFormData } from "@/components/provider/ProviderProfileForm";
import toast from "react-hot-toast";

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login?redirect=/provider/onboarding");
        return;
      }
      setUserId(session.user.id);

      const { profile } = await getMyProviderProfile();
      if (profile) {
        router.replace("/provider/edit");
        return;
      }
      setChecking(false);
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
      const url = await uploadPortfolioPhoto(newPhotos[i], i);
      if (url) uploadedUrls.push(url);
    }

    const { error } = await createProviderProfile({
      ...data,
      portfolio_urls: uploadedUrls,
    });

    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    // Fire-and-forget provider creation log
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return;
      fetch("/api/log-activity", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "provider.created",
          event_category: "provider",
          target_type: "provider",
          target_id: userId,
          description: `Provider profile created: ${data.headline}`,
          metadata: { category: data.main_category, city: data.home_city, hourly_rate: data.hourly_rate ?? null },
        }),
      }).catch(() => {});
    });

    toast.success("Profil creat! Bun venit pe MesteRO.");
    router.push(`/pros/${userId}`);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi acasă
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow flex-shrink-0">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Devino meșter
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
              Configurează-ți profilul public și începe să primești clienți.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 md:p-8"
        >
          <ProviderProfileForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="Creează profilul meu →"
          />
        </motion.div>
      </div>
    </div>
  );
}
