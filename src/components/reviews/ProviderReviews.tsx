"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/reviews/StarRating";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: { full_name: string; avatar_url: string | null } | null;
}

interface ProviderReviewsProps {
  providerId: string;
  initialRating: number;
  initialCount: number;
}

const INITIAL_SHOW = 10;

function formatRoRelative(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);

  if (minutes < 2) return "acum";
  if (minutes < 60) return `acum ${minutes} min`;
  if (hours < 24) return `acum ${hours} ore`;
  if (days < 30) return `acum ${days} zile`;
  if (months < 12) return `acum ${months} luni`;
  return date.toLocaleDateString("ro-RO", { month: "short", year: "numeric" });
}

export function ProviderReviews({
  providerId,
  initialRating,
  initialCount,
}: ProviderReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/reviews/by-provider/${providerId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [providerId]);

  const visible = showAll ? reviews : reviews.slice(0, INITIAL_SHOW);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Recenzii
        </h2>
        <StarRating value={initialRating} count={initialCount} size="md" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-50 rounded-xl p-4">
              <div className="flex gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-slate-100" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-100 rounded w-1/3 mb-1.5" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full mb-1" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">
          Acest meșter nu are recenzii publice încă.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {visible.map((review) => {
              const isExpanded = expandedIds.has(review.id);
              const longComment =
                review.comment && review.comment.length > 200;
              const displayComment =
                longComment && !isExpanded
                  ? review.comment!.slice(0, 200) + "…"
                  : review.comment;

              return (
                <div
                  key={review.id}
                  className="bg-slate-50 rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar
                      name={review.reviewer?.full_name ?? "?"}
                      src={review.reviewer?.avatar_url ?? undefined}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <p className="text-sm font-medium text-slate-900">
                          {review.reviewer?.full_name ?? "Utilizator"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatRoRelative(review.created_at)}
                        </p>
                      </div>
                      <StarRating value={review.rating} size="sm" className="mt-0.5" />
                    </div>
                  </div>
                  {displayComment && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {displayComment}
                      {longComment && (
                        <button
                          onClick={() =>
                            setExpandedIds((prev) => {
                              const next = new Set(prev);
                              isExpanded ? next.delete(review.id) : next.add(review.id);
                              return next;
                            })
                          }
                          className="ml-1 text-brand-600 font-medium hover:underline text-xs"
                        >
                          {isExpanded ? "Citește mai puțin" : "Citește mai mult"}
                        </button>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {!showAll && reviews.length > INITIAL_SHOW && (
            <div className="mt-4 text-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAll(true)}
              >
                Vezi toate recenziile ({reviews.length})
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
