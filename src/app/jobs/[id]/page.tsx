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
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { getJob, type Job } from "@/lib/jobs";
import { supabase } from "@/lib/supabase";
import { categories } from "@/data/dummy";
import { formatRelativeTime } from "@/lib/utils";

function ContactButton({
  jobClientId,
  onContact,
  isLoading,
}: {
  jobClientId: string;
  onContact: () => void;
  isLoading: boolean;
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id ?? null);
    });
  }, []);

  // Still loading auth state
  if (currentUserId === undefined) return null;
  // Viewer is the job poster — hide button
  if (currentUserId === jobClientId) return null;

  return (
    <Button
      fullWidth
      size="lg"
      leftIcon={<MessageSquare className="h-4 w-4" />}
      isLoading={isLoading}
      onClick={onContact}
    >
      Contact Client
    </Button>
  );
}

function timeframeLabel(t: string) {
  if (t === "asap") return "ASAP";
  if (t === "specific_date") return "Specific Date";
  return "Flexible";
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);

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
    // Don't show the button if I'm the poster (handled in render), but guard here too
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-16">
        <p className="text-zinc-500 dark:text-zinc-400">Job not found.</p>
        <Link href="/jobs">
          <Button variant="ghost" size="sm">
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid gap-5">
          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 md:p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {cat && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      <span>{cat.icon}</span>
                      {cat.name}
                    </span>
                  )}
                  <Badge variant="success" dot>
                    Open
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {job.title}
                </h1>
              </div>
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                {job.budget && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {job.budget.toLocaleString()} RON
                    </p>
                    <p className="text-xs text-zinc-400">Budget</p>
                  </div>
                )}
                <FavoriteButton targetType="job" targetId={job.id} />
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
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
                Posted {formatRelativeTime(job.created_at)}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Description
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed text-sm">
                {job.description}
              </p>
            </div>

            {/* Photos */}
            {job.photo_urls?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Photos
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {job.photo_urls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox(url)}
                      className="aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:opacity-90 transition-opacity"
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

            {/* CTA — hidden if viewer is the job poster */}
            <ContactButton
              jobClientId={job.client_id}
              onContact={handleContact}
              isLoading={contacting}
            />
          </motion.div>

          {/* Posted by */}
          {job.profiles && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5"
            >
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Posted by
              </p>
              <div className="flex items-center gap-3">
                <Avatar
                  name={job.profiles.full_name}
                  src={job.profiles.avatar_url ?? undefined}
                  size="md"
                />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white text-sm">
                    {job.profiles.full_name}
                  </p>
                  <p className="text-xs text-zinc-400">Member</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

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
