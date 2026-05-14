"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/admin/DeleteModal";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, Trash2, Briefcase, Shield } from "lucide-react";

type AdminFavorite = {
  id: string;
  type: "job" | "provider";
  user_id: string;
  target_id: string;
  user_name: string;
  user_email: string;
  target_title: string;
  created_at: string;
};

const PAGE_SIZE = 100;

export default function AdminFavoritesPage() {
  const [token, setToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<AdminFavorite[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<AdminFavorite | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setToken(session.access_token);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [typeFilter]);

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({
        search: debouncedSearch,
        type: typeFilter,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/favorites?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, typeFilter, page]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const confirmDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    setFavorites((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    setTotal((t) => t - 1);
    try {
      const p = new URLSearchParams({
        type: deleteTarget.type,
        user_id: deleteTarget.user_id,
        target_id: deleteTarget.target_id,
      });
      const res = await fetch(`/api/admin/favorites?${p}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
    } catch {
      fetchFavorites();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Favorites</h1>
        <p className="text-zinc-400 text-sm mt-0.5">{total.toLocaleString()} total</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
        <input
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Search by user name, email, or target title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {(
          [
            ["", "All types"],
            ["job", "Jobs"],
            ["provider", "Providers"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTypeFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              typeFilter === v
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Type
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                User
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Target
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Saved
              </th>
              <th className="px-4 py-1.5 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-1.5">
                      <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : favorites.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  No favorites found
                </td>
              </tr>
            ) : (
              favorites.map((fav) => (
                <tr key={fav.id} className="hover:bg-violet-500/[0.05] transition-colors">
                  <td className="px-4 py-1.5">
                    <Badge variant={fav.type === "job" ? "info" : "purple"}>
                      <span className="flex items-center gap-1">
                        {fav.type === "job" ? (
                          <Briefcase className="h-3 w-3" />
                        ) : (
                          <Shield className="h-3 w-3" />
                        )}
                        {fav.type}
                      </span>
                    </Badge>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="text-zinc-300 text-xs">{fav.user_name || "—"}</div>
                    <div className="text-zinc-500 text-xs font-mono">{fav.user_email}</div>
                  </td>
                  <td className="px-4 py-1.5 text-zinc-300 max-w-[280px]">
                    <span className="truncate block">{fav.target_title || "—"}</span>
                  </td>
                  <td className="px-4 py-1.5 text-zinc-400 text-xs whitespace-nowrap">
                    {formatDate(fav.created_at)}
                  </td>
                  <td className="px-4 py-1.5">
                    <button
                      onClick={() => setDeleteTarget(fav)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
          {favorites.length === 0
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
        description={`Remove this ${deleteTarget?.type} favorite by "${deleteTarget?.user_email}". This cannot be undone.`}
      />
    </div>
  );
}
