"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Calendar,
  MessageSquare,
  ArrowLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { JobReviewSection } from "@/components/reviews/JobReviewSection";
import { getJob, type Job } from "@/lib/jobs";
import { supabase } from "@/lib/supabase";
import { categories } from "@/data/dummy";
import { formatRelativeTime } from "@/lib/utils";

function ContactButton({
  jobClientId,
  currentUserId,
  onContact,
  isLoading,
}: {
  jobClientId: string;
  currentUserId: string | null | undefined;
  onContact: () => void;
  isLoading: boolean;
}) {
  if (currentUserId === undefined) return null;
  if (currentUserId === jobClientId) return null;

  return (
    <Button
      fullWidth
      size="lg"
      leftIcon={<MessageSquare className="h-4 w-4" />}
      isLoading={isLoading}
      onClick={onContact}
    >
      Contactează clientul
    </Button>
  );
}

function timeframeLabel(t: string) {
  if (t === "asap") return "Urgent";
  if (t === "specific_date") return "Dată specifică";
  return "Flexibil";
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (id) {
      getJob(id).then(({ job }) => {
        setJob(job);
        setLoading(false);
      });
    }
  }, [id]);

  const handleContact = async () => {
    if (!job) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/login?redirect=/jobs/${id}`);
      return;
    }
    if (session.user.id === job.client_id) return;

    setContacting(true);
    try {
      const r = await fetch("/api/conversations/start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otherUserId: job.client_id,
          contextType: "job",
          contextJobId: job.id,
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

  const cat = categories.find((c) => c.slug === job?.category);

  // Wait for both job and auth to resolve before deciding access
  if (loading || currentUserId === undefined) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 pt-16">
        <p className="text-slate-500">Lucrarea nu a fost găsită.</p>
        <Link href="/jobs">
          <Button variant="ghost" size="sm">
            Înapoi la lucrări
          </Button>
        </Link>
      </div>
    );
  }

  // Restrict non-open jobs to participants only
  const isParticipant =
    currentUserId === job.client_id || currentUserId === job.awarded_provider_id;

  if (job.status !== "open" && !isParticipant) {
    return (
      <div className="w-full min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la lucrări
          </Link>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <p className="text-slate-900 font-semibold text-lg mb-2">
              Lucrare indisponibilă
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Această lucrare a fost acordată și nu mai este disponibilă public.
            </p>
            <Link href="/jobs">
              <Button variant="ghost" size="sm">
                Caută alte lucrări
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pt-24 pb-24 sm:pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la lucrări
        </Link>

        <div className="grid gap-5">
          {/* Review section — completed jobs, participants only */}
          {job.status === "completed" && isParticipant && currentUserId && (
            <JobReviewSection
              jobId={job.id}
              currentUserId={currentUserId}
              isClient={currentUserId === job.client_id}
              otherPartyId={
                currentUserId === job.client_id
                  ? (job.awarded_provider_id ?? null)
                  : job.client_id
              }
              otherPartyName={
                currentUserId === job.client_id
                  ? (job.awarded_provider_profile?.full_name ?? "Meșterul")
                  : (job.profiles?.full_name ?? "Clientul")
              }
            />
          )}

          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {cat && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      <span>{cat.icon}</span>
                      {cat.name}
                    </span>
                  )}
                  <JobStatusBadge status={job.status} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {job.title}
                </h1>
              </div>
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                {job.budget && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      {job.budget.toLocaleString()} RON
                    </p>
                    <p className="text-xs text-slate-400">Buget</p>
                  </div>
                )}
                <FavoriteButton targetType="job" targetId={job.id} />
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                {job.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 flex-shrink-0" />
                {timeframeLabel(job.timeframe)}
                {job.timeframe === "specific_date" &&
                  job.scheduled_date &&
                  ` — ${new Date(job.scheduled_date).toLocaleDateString("ro-RO")}`}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                Postat {formatRelativeTime(job.created_at)}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Descriere
              </h2>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">
                {job.description}
              </p>
            </div>

            {/* Photos */}
            {job.photo_urls?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Fotografii
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {job.photo_urls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox(url)}
                      className="aspect-square rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={url}
                        alt={`Photo ${i + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status banner for awarded provider */}
            {job.status !== "open" && currentUserId === job.awarded_provider_id && (
              <div className="rounded-xl px-4 py-3 text-sm mb-4 bg-brand-50 border border-brand-200 text-brand-800">
                Această lucrare îți este acordată.
              </div>
            )}

            {/* CTA — shown for open jobs (non-poster) or awarded provider; hidden on mobile (see sticky bar below) */}
            {(job.status === "open" || job.awarded_provider_id === currentUserId) && (
              <div className="hidden sm:block">
                <ContactButton
                  jobClientId={job.client_id}
                  currentUserId={currentUserId}
                  onContact={handleContact}
                  isLoading={contacting}
                />
              </div>
            )}
          </motion.div>

          {/* Posted by */}
          {job.profiles && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-50 rounded-2xl border border-slate-200 p-5"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Postat de
              </p>
              <div className="flex items-center gap-3">
                <Avatar
                  name={job.profiles.full_name}
                  src={job.profiles.avatar_url ?? undefined}
                  size="md"
                />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {job.profiles.full_name}
                  </p>
                  <p className="text-xs text-slate-400">Membru</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sticky mobile CTA */}
      {(job.status === "open" || job.awarded_provider_id === currentUserId) && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 p-3 shadow-lg">
          <ContactButton
            jobClientId={job.client_id}
            currentUserId={currentUserId}
            onContact={handleContact}
            isLoading={contacting}
          />
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="h-7 w-7" />
          </button>
          <Image
            src={lightbox}
            alt="Full size"
            width={1200}
            height={900}
            className="max-h-[90vh] max-w-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
