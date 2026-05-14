"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DeleteModal } from "@/components/admin/DeleteModal";
import { InlineEdit } from "@/components/admin/InlineEdit";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { categories } from "@/data/dummy";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Star,
} from "lucide-react";

type AdminProvider = {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  headline: string;
  main_category: string;
  home_city: string;
  hourly_rate: number | null;
  is_active: boolean;
  is_verified: boolean;
  average_rating: number;
  jobs_completed: number;
  service_radius_km: number | null;
  bio: string | null;
  skills: string[] | null;
  portfolio_urls: string[] | null;
  years_experience: number | null;
  response_time: string | null;
  created_at: string;
};

const PAGE_SIZE = 100;

export default function AdminProvidersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [isVerifiedFilter, setIsVerifiedFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const [editProvider, setEditProvider] = useState<AdminProvider | null>(null);
  const [editForm, setEditForm] = useState<{
    bio: string;
    skills_text: string;
    portfolio_urls_text: string;
    main_category: string;
    is_active: boolean;
    is_verified: boolean;
    years_experience: string;
    response_time: string;
  }>({
    bio: "",
    skills_text: "",
    portfolio_urls_text: "",
    main_category: "",
    is_active: true,
    is_verified: false,
    years_experience: "",
    response_time: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProvider | null>(null);
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
  }, [isActiveFilter, isVerifiedFilter, categoryFilter, sort, sortDir]);

  const fetchProviders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({
        search: debouncedSearch,
        is_active: isActiveFilter,
        is_verified: isVerifiedFilter,
        category: categoryFilter,
        sort,
        dir: sortDir,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/providers?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [
    token,
    debouncedSearch,
    isActiveFilter,
    isVerifiedFilter,
    categoryFilter,
    sort,
    sortDir,
    page,
  ]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const toggleSort = (col: string) => {
    if (sort === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(col);
      setSortDir("desc");
    }
  };

  const patchProvider = async (provider: AdminProvider, field: string, value: unknown) => {
    const original = (provider as Record<string, unknown>)[field];
    setProviders((prev) =>
      prev.map((p) => (p.user_id === provider.user_id ? { ...p, [field]: value } : p))
    );
    try {
      const res = await fetch(`/api/admin/providers/${provider.user_id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setProviders((prev) =>
        prev.map((p) =>
          p.user_id === provider.user_id ? { ...p, [field]: original } : p
        )
      );
    }
  };

  const openEdit = (p: AdminProvider) => {
    setEditProvider(p);
    setEditForm({
      bio: p.bio ?? "",
      skills_text: (p.skills ?? []).join("\n"),
      portfolio_urls_text: (p.portfolio_urls ?? []).join("\n"),
      main_category: p.main_category,
      is_active: p.is_active,
      is_verified: p.is_verified,
      years_experience: p.years_experience !== null ? String(p.years_experience) : "",
      response_time: p.response_time ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editProvider || !token) return;
    setSaving(true);
    try {
      const payload = {
        bio: editForm.bio,
        main_category: editForm.main_category,
        is_active: editForm.is_active,
        is_verified: editForm.is_verified,
        years_experience: editForm.years_experience ? Number(editForm.years_experience) : null,
        response_time: editForm.response_time || null,
        skills: editForm.skills_text
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        portfolio_urls: editForm.portfolio_urls_text
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch(`/api/admin/providers/${editProvider.user_id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setProviders((prev) =>
          prev.map((p) =>
            p.user_id === editProvider.user_id ? { ...p, ...payload } : p
          )
        );
        setEditProvider(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/providers/${deleteTarget.user_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProviders((prev) => prev.filter((p) => p.user_id !== deleteTarget.user_id));
        setTotal((t) => t - 1);
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
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

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Providers</h1>
        <p className="text-zinc-400 text-sm mt-0.5">{total.toLocaleString()} total</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
        <input
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Search by name, email, headline, or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {(
          [
            ["", "All"],
            ["true", "Active"],
            ["false", "Inactive"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setIsActiveFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isActiveFilter === v
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
            ["", "Any verification"],
            ["true", "Verified"],
            ["false", "Unverified"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setIsVerifiedFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isVerifiedFilter === v
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="w-px bg-zinc-700 self-stretch mx-0.5" />
        <select
          className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="w-px bg-zinc-700 self-stretch mx-0.5" />
        <select
          className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          value={`${sort}:${sortDir}`}
          onChange={(e) => {
            const [col, dir] = e.target.value.split(":");
            setSort(col);
            setSortDir(dir as "asc" | "desc");
          }}
        >
          <option value="created_at:desc">Newest first</option>
          <option value="created_at:asc">Oldest first</option>
          <option value="average_rating:desc">Highest rated</option>
          <option value="hourly_rate:desc">Highest rate</option>
          <option value="hourly_rate:asc">Lowest rate</option>
          <option value="jobs_completed:desc">Most jobs</option>
        </select>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm min-w-[1200px]">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
              <th className="w-10 px-4 py-1.5" />
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="headline" label="Name / Headline" />
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Email
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Category
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                City
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="hourly_rate" label="Rate" />
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="average_rating" label="Rating" />
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="jobs_completed" label="Jobs" />
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="created_at" label="Joined" />
              </th>
              <th className="px-4 py-1.5 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 11 }).map((_, j) => (
                    <td key={j} className="px-4 py-1.5">
                      <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : providers.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-zinc-500">
                  No providers found
                </td>
              </tr>
            ) : (
              providers.map((p) => {
                const cat = categories.find((c) => c.slug === p.main_category);
                return (
                  <tr key={p.user_id} className="hover:bg-violet-500/[0.05] transition-colors">
                    <td className="px-4 py-1.5">
                      <Avatar
                        name={p.full_name || p.email}
                        src={p.avatar_url ?? undefined}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-1.5 max-w-[200px]">
                      <div className="font-medium text-white text-xs truncate">{p.full_name}</div>
                      <InlineEdit
                        value={p.headline}
                        onSave={(v) => patchProvider(p, "headline", v)}
                        className="text-zinc-400 text-xs"
                      />
                    </td>
                    <td className="px-4 py-1.5 text-zinc-300 font-mono text-xs">{p.email}</td>
                    <td className="px-4 py-1.5 text-zinc-300 text-xs whitespace-nowrap">
                      {cat ? `${cat.icon} ${cat.name}` : p.main_category}
                    </td>
                    <td className="px-4 py-1.5 text-zinc-300">
                      <InlineEdit
                        value={p.home_city}
                        onSave={(v) => patchProvider(p, "home_city", v)}
                      />
                    </td>
                    <td className="px-4 py-1.5 text-zinc-300 whitespace-nowrap">
                      <InlineEdit
                        value={p.hourly_rate}
                        type="number"
                        formatter={(v) =>
                          v !== null && v !== undefined ? `${v} RON` : "—"
                        }
                        onSave={(v) =>
                          patchProvider(p, "hourly_rate", v ? Number(v) : null)
                        }
                      />
                    </td>
                    <td className="px-4 py-1.5">
                      <div className="flex flex-col gap-1">
                        <Badge variant={p.is_active ? "success" : "default"} dot>
                          {p.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {p.is_verified && <Badge variant="info">Verified</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-1.5 text-zinc-300 text-xs whitespace-nowrap">
                      {p.average_rating > 0 ? (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          {p.average_rating.toFixed(1)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-1.5 text-zinc-300 text-xs">{p.jobs_completed}</td>
                    <td className="px-4 py-1.5 text-zinc-400 text-xs whitespace-nowrap">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove provider profile"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-zinc-400">
        <span>
          {providers.length === 0
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

      <Modal
        isOpen={!!editProvider}
        onClose={() => setEditProvider(null)}
        title={`Edit Provider: ${editProvider?.full_name}`}
        size="lg"
      >
        {editProvider && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Main Category
                </label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={editForm.main_category}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, main_category: e.target.value }))
                  }
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Years Experience
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={editForm.years_experience}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, years_experience: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Response Time
                </label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={editForm.response_time}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, response_time: e.target.value }))
                  }
                  placeholder="e.g. Within 1 hour"
                />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2.5 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-brand-500 w-4 h-4"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                />
                Active
              </label>
              <label className="flex items-center gap-2.5 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-brand-500 w-4 h-4"
                  checked={editForm.is_verified}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, is_verified: e.target.checked }))
                  }
                />
                Verified
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Bio</label>
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Skills (one per line)
                </label>
                <textarea
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  rows={4}
                  value={editForm.skills_text}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, skills_text: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Portfolio URLs (one per line)
                </label>
                <textarea
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  rows={4}
                  value={editForm.portfolio_urls_text}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, portfolio_urls_text: e.target.value }))
                  }
                  placeholder="https://…"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={() => setEditProvider(null)}>
                Cancel
              </Button>
              <Button size="sm" isLoading={saving} onClick={saveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        description={`Remove provider profile for "${deleteTarget?.full_name}". The user account will NOT be deleted — only their provider profile.`}
      />
    </div>
  );
}
