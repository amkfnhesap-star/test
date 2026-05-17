"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/reviews/StarRating";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type ReviewEntry = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  direction: string;
  revealed_at: string | null;
  other_party: { full_name: string; avatar_url: string | null } | null;
  job: { title: string } | null;
};

function formatRoDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ReviewCard({ review, isGiven }: { review: ReviewEntry; isGiven?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start gap-3 mb-3">
        <Avatar
          name={review.other_party?.full_name ?? "?"}
          src={review.other_party?.avatar_url ?? undefined}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-1 mb-0.5">
            <p className="text-sm font-semibold text-slate-900">
              {review.other_party?.full_name ?? "Utilizator"}
            </p>
            <p className="text-xs text-slate-400">{formatRoDate(review.created_at)}</p>
          </div>
          <StarRating value={review.rating} size="sm" />
          {review.job && (
            <p className="text-xs text-slate-400 mt-0.5">
              Lucrare:{" "}
              <span className="font-medium text-slate-600">{review.job.title}</span>
            </p>
          )}
        </div>
      </div>
      {review.comment ? (
        <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
      ) : (
        <p className="text-xs text-slate-400 italic">Fără comentariu.</p>
      )}
      {isGiven && !review.revealed_at && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1 mt-3 w-fit">
          Așteptând recenzia celeilalte părți
        </p>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
      <div className="flex justify-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-slate-200 fill-slate-200" />
        ))}
      </div>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

export default function DashboardReviewsPage() {
  const [tab, setTab] = useState<"received" | "given">("received");
  const [received, setReceived] = useState<ReviewEntry[]>([]);
  const [given, setGiven] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const res = await fetch("/api/reviews/my", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReceived(data.received ?? []);
        setGiven(data.given ?? []);
      }
      setLoading(false);
    });
  }, []);

  const tabs = [
    { id: "received" as const, label: "Primite", count: received.length },
    { id: "given" as const, label: "Date", count: given.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Recenziile mele
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Recenziile primite și date de tine.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 w-fit">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === id
                ? "bg-brand-500 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            {label}
            {count > 0 && (
              <span
                className={cn(
                  "ml-1.5 text-xs rounded-full px-1.5 py-0.5",
                  tab === id
                    ? "bg-white/20"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                )}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 animate-pulse"
            >
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
      ) : tab === "received" ? (
        received.length === 0 ? (
          <EmptyState label="Nu ai primit nicio recenzie publică încă." />
        ) : (
          <div className="space-y-3">
            {received.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )
      ) : given.length === 0 ? (
        <EmptyState label="Nu ai lăsat nicio recenzie încă." />
      ) : (
        <div className="space-y-3">
          {given.map((r) => (
            <ReviewCard key={r.id} review={r} isGiven />
          ))}
        </div>
      )}
    </div>
  );
}
