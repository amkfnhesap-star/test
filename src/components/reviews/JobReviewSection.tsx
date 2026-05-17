"use client";

import { useEffect, useState, useCallback } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { StarRating } from "@/components/reviews/StarRating";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  direction: string;
  revealed_at: string | null;
  reviewer_id: string;
  reviewee_id: string;
  reviewer: { full_name: string; avatar_url: string | null } | null;
  reviewee: { full_name: string; avatar_url: string | null } | null;
}

interface JobReviewSectionProps {
  jobId: string;
  currentUserId: string;
  isClient: boolean;
  otherPartyId: string | null;
  otherPartyName: string;
}

function formatRoDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function JobReviewSection({
  jobId,
  currentUserId,
  isClient,
  otherPartyId,
  otherPartyName,
}: JobReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loaded, setLoaded] = useState(false);

  const myDirection = isClient ? "client_to_provider" : "provider_to_client";
  const myReview = reviews.find((r) => r.direction === myDirection);
  const theirDirection = isClient ? "provider_to_client" : "client_to_provider";
  const theirReview = reviews.find((r) => r.direction === theirDirection);

  const load = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`/api/reviews/by-job/${jobId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setLoaded(true);
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded) return null;

  // Case A: I haven't submitted my review yet
  if (!myReview) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-50 border-l-4 border-brand-500 rounded-2xl p-6 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-brand-800 mb-4 uppercase tracking-wide">
          Lasă o recenzie
        </h2>
        <ReviewForm
          jobId={jobId}
          revieweeId={otherPartyId ?? ""}
          revieweeName={otherPartyName}
          direction={myDirection as "client_to_provider" | "provider_to_client"}
          onSubmitted={load}
        />
      </motion.div>
    );
  }

  // Case C: Both reviews submitted and revealed
  if (myReview && theirReview && myReview.revealed_at) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm"
      >
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Recenzii pentru această lucrare
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[myReview, theirReview].map((r) => {
            const party = r.reviewer_id === currentUserId ? r.reviewer : r.reviewee;
            const reviewerParty = r.reviewer;
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar
                    name={reviewerParty?.full_name ?? "?"}
                    src={reviewerParty?.avatar_url ?? undefined}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {reviewerParty?.full_name ?? "Utilizator"}
                    </p>
                    <p className="text-xs text-slate-400">{formatRoDate(r.created_at)}</p>
                  </div>
                  <StarRating value={r.rating} size="sm" />
                </div>
                {r.comment && (
                  <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // Case B: I submitted but waiting for other party
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-amber-800 mb-1">
        Recenzia ta este înregistrată
      </h2>
      <p className="text-sm text-amber-700 mb-4">
        Aștepți ca{" "}
        <span className="font-medium">{otherPartyName}</span> să lase și el o
        recenzie. După aceea, ambele vor fi vizibile public.
      </p>

      {/* Show own review preview */}
      <div className="bg-white rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  "h-4 w-4",
                  s <= myReview.rating
                    ? "text-brand-500 fill-brand-500"
                    : "text-slate-200 fill-slate-200"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {myReview.rating}/5
          </span>
        </div>
        {myReview.comment && (
          <p className="text-sm text-slate-600 italic">&ldquo;{myReview.comment}&rdquo;</p>
        )}
      </div>
    </motion.div>
  );
}
