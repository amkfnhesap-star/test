"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/admin/DeleteModal";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Star, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  direction: string;
  revealed_at: string | null;
  reviewer: { full_name: string; avatar_url: string | null } | null;
  reviewee: { full_name: string; avatar_url: string | null } | null;
  job: { title: string } | null;
};

const PAGE_SIZE = 100;

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${
            s <= rating ? "text-brand-400 fill-brand-400" : "text-zinc-700 fill-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [directionFilter, setDirectionFilter] = useState("");
  const [revealedFilter, setRevealedFilter] = useState("");
  const [sort, setSort] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setToken(session.access_token);
    });
  }, []);

  const fetchReviews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({
        direction: directionFilter,
        revealed: revealedFilter,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/reviews?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [token, directionFilter, revealedFilter, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    setPage(0);
  }, [directionFilter, revealedFilter]);

  const toggleSort = (col: string) => {
    if (sort === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(col);
      setSortDir("desc");
    }
  };

  const SortBtn = ({ col, label }: { col: string; label: string }) => (
    <button
      onClick={() => toggleSort(col)}
      className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
    >
      {label}
      {sort === col ? (
        sortDir === "asc" ? (
          <ChevronUp className="h-3 w-3 text-brand-400" />
        ) : (
          <ChevronDown className="h-3 w-3 text-brand-400" />
        )
      ) : (
        <ChevronDown className="h-3 w-3 opacity-25" />
      )}
    </button>
  );

  const confirmDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/reviews/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        setTotal((t) => t - 1);
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-zinc-400 text-sm mt-0.5">{total.toLocaleString()} total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-5">
        {(
          [
            ["", "All directions"],
            ["client_to_provider", "Client → Meșter"],
            ["provider_to_client", "Meșter → Client"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setDirectionFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              directionFilter === v
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="w-px bg-zinc-700 self-stretch mx-0.5" />
        {(
          [
            ["", "All"],
            ["true", "Revealed"],
            ["false", "Pending"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setRevealedFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              revealedFilter === v
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
              <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="created_at" label="Date" />
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Reviewer
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Reviewee
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Direction
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Rating
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Comment
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Revealed
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Job
              </th>
              <th className="px-4 py-2 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-2">
                      <div className="h-4 bg-zinc-800 rounded animate-pulse" style={{ width: "80%" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-zinc-500">
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="hover:bg-violet-500/[0.05] transition-colors">
                  <td className="px-4 py-2 text-zinc-400 text-xs whitespace-nowrap">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={r.reviewer?.full_name ?? "?"}
                        src={r.reviewer?.avatar_url ?? undefined}
                        size="sm"
                      />
                      <span className="text-zinc-300 text-xs">
                        {r.reviewer?.full_name ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={r.reviewee?.full_name ?? "?"}
                        src={r.reviewee?.avatar_url ?? undefined}
                        size="sm"
                      />
                      <span className="text-zinc-300 text-xs">
                        {r.reviewee?.full_name ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-zinc-400 text-xs">
                      {r.direction === "client_to_provider"
                        ? "Client → Meșter"
                        : "Meșter → Client"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <StarDisplay rating={r.rating} />
                  </td>
                  <td className="px-4 py-2 max-w-[200px]">
                    <span className="text-zinc-300 text-xs line-clamp-2">
                      {r.comment ?? <span className="text-zinc-600 italic">—</span>}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {r.revealed_at ? (
                      <span className="text-emerald-400 text-xs font-medium">Yes</span>
                    ) : (
                      <span className="text-zinc-500 text-xs">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2 max-w-[150px]">
                    <span className="text-zinc-400 text-xs truncate block">
                      {r.job?.title ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-zinc-400">
        <span>
          {reviews.length === 0
            ? "0"
            : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)}`}{" "}
          of {total.toLocaleString()}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={(page + 1) * PAGE_SIZE >= total}
            onClick={() => setPage((p) => p + 1)}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      </div>

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        description={`Sunteți sigur că doriți să ștergeți această recenzie? Această acțiune nu poate fi anulată.`}
      />
    </div>
  );
}
