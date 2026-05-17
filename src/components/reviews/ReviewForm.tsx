"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const RATING_LABELS = ["", "Foarte slab", "Slab", "OK", "Bun", "Excelent"];

interface ReviewFormProps {
  jobId: string;
  revieweeId: string;
  revieweeName: string;
  direction: "client_to_provider" | "provider_to_client";
  onSubmitted: () => void;
}

export function ReviewForm({
  jobId,
  revieweeId,
  revieweeName,
  direction,
  onSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const displayRating = hovered || rating;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job_id: jobId, reviewee_id: revieweeId, rating, comment, direction }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Eroare la trimiterea recenziei.");
      } else {
        toast.success("Recenzia a fost trimisă!");
        onSubmitted();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-semibold text-slate-900">
        Cum a fost experiența ta cu{" "}
        <span className="text-brand-600">{revieweeName}</span>?
      </p>

      {/* Star selector */}
      <div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  hovered > 0
                    ? star <= hovered
                      ? "text-brand-300 fill-brand-300"
                      : "text-slate-200 fill-slate-200"
                    : star <= rating
                    ? "text-brand-500 fill-brand-500"
                    : "text-slate-200 fill-slate-200"
                )}
              />
            </button>
          ))}
        </div>
        {displayRating > 0 && (
          <p className="text-sm text-slate-500 mt-1.5">
            {RATING_LABELS[displayRating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="relative">
        <label className="block text-xs font-medium text-slate-500 mb-1.5">
          Adaugă un comentariu (opțional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder="Ce a mers bine? Recomanzi acest meșter?"
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
        />
        <span className="absolute bottom-2.5 right-3 text-[11px] text-slate-400">
          {comment.length}/500
        </span>
      </div>

      {/* Blind reveal notice */}
      <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 leading-relaxed">
        Recenzia ta va fi vizibilă publicului doar după ce și{" "}
        <span className="font-medium">{revieweeName}</span> lasă o recenzie.
        Astfel, recenziile sunt mai oneste.
      </p>

      <Button
        onClick={handleSubmit}
        isLoading={submitting}
        disabled={rating === 0}
        fullWidth
      >
        Trimite recenzia
      </Button>
    </div>
  );
}
