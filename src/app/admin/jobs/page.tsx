"use client";

import { useState, useEffect, useCallback } from "react";
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
  ImageIcon,
} from "lucide-react";

type AdminJob = {
  id: string;
  title: string;
  category: string;
  city: string | null;
  budget: number | null;
  status: string;
  client_id: string;
  poster_name: string;
  poster_email: string;
  photos_count: number;
  description: string | null;
  photo_urls: string[] | null;
  timeframe: string | null;
  scheduled_date: string | null;
  created_at: string;
};

const PAGE_SIZE = 100;
const JOB_STATUSES = ["open", "in_progress", "closed"];

const statusBadge = (s: string) =>
  s === "open" ? "success" : s === "in_progress" ? "warning" : "default";

export default function AdminJobsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [hasPhotosFilter, setHasPhotosFilter] = useState("");
  const [sort, setSort] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const [editJob, setEditJob] = useState<AdminJob | null>(null);
  const [editForm, setEditForm] = useState<{
    description: string;
    category: string;
    status: string;
    timeframe: string;
    scheduled_date: string;
    photo_urls_text: string;
  }>({
    description: "",
    category: "",
    status: "open",
    timeframe: "flexible",
    scheduled_date: "",
    photo_urls_text: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminJob | null>(null);
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
  }, [statusFilter, categoryFilter, hasPhotosFilter, sort, sortDir]);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        category: categoryFilter,
        has_photos: hasPhotosFilter,
        sort,
        dir: sortDir,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/jobs?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, statusFilter, categoryFilter, hasPhotosFilter, sort, sortDir, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const toggleSort = (col: string) => {
    if (sort === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(col);
      setSortDir("desc");
    }
  };

  const patchJob = async (job: AdminJob, field: string, value: unknown) => {
    const original = (job as Record<string, unknown>)[field];
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, [field]: value } : j)));
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, [field]: original } : j)));
    }
  };

  const openEdit = (job: AdminJob) => {
    setEditJob(job);
    setEditForm({
      description: job.description ?? "",
      category: job.category,
      status: job.status,
      timeframe: job.timeframe ?? "flexible",
      scheduled_date: job.scheduled_date ?? "",
      photo_urls_text: (job.photo_urls ?? []).join("\n"),
    });
  };

  const saveEdit = async () => {
    if (!editJob || !token) return;
    setSaving(true);
    try {
      const { photo_urls_text, ...rest } = editForm;
      const payload = {
        ...rest,
        photo_urls: photo_urls_text
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch(`/api/admin/jobs/${editJob.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === editJob.id
              ? { ...j, ...payload, photos_count: payload.photo_urls.length }
              : j
          )
        );
        setEditJob(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/jobs/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
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
        <h1 className="text-2xl font-bold text-white">Jobs</h1>
        <p className="text-zinc-400 text-sm mt-0.5">{total.toLocaleString()} total</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
        <input
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Search by title, description, or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {(["", ...JOB_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              statusFilter === s
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700"
            }`}
          >
            {s === "" ? "All statuses" : s.replace("_", " ")}
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
        {(
          [
            ["", "Any photos"],
            ["true", "Has photos"],
            ["false", "No photos"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setHasPhotosFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              hasPhotosFilter === v
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="title" label="Title" />
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="category" label="Category" />
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                City
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="budget" label="Budget" />
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="status" label="Status" />
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Poster
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Photos
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="created_at" label="Created" />
              </th>
              <th className="px-4 py-1.5 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-1.5">
                      <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-zinc-500">
                  No jobs found
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const cat = categories.find((c) => c.slug === job.category);
                return (
                  <tr key={job.id} className="hover:bg-violet-500/[0.05] transition-colors">
                    <td className="px-4 py-1.5 font-medium text-white max-w-[200px]">
                      <InlineEdit
                        value={job.title}
                        onSave={(v) => patchJob(job, "title", v)}
                      />
                    </td>
                    <td className="px-4 py-1.5 text-zinc-300 text-xs whitespace-nowrap">
                      {cat ? `${cat.icon} ${cat.name}` : job.category}
                    </td>
                    <td className="px-4 py-1.5 text-zinc-300">
                      <InlineEdit
                        value={job.city}
                        onSave={(v) => patchJob(job, "city", v || null)}
                      />
                    </td>
                    <td className="px-4 py-1.5 text-zinc-300 whitespace-nowrap">
                      <InlineEdit
                        value={job.budget}
                        type="number"
                        formatter={(v) =>
                          v !== null && v !== undefined ? `${v} RON` : "—"
                        }
                        onSave={(v) => patchJob(job, "budget", v ? Number(v) : null)}
                      />
                    </td>
                    <td className="px-4 py-1.5">
                      <Badge variant={statusBadge(job.status) as any}>
                        {job.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-1.5">
                      <div className="text-zinc-300 text-xs">{job.poster_name || "—"}</div>
                      <div className="text-zinc-500 text-xs font-mono">{job.poster_email}</div>
                    </td>
                    <td className="px-4 py-1.5 text-zinc-400 text-xs">
                      {job.photos_count > 0 ? (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> {job.photos_count}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-1.5 text-zinc-400 text-xs whitespace-nowrap">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="px-4 py-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(job)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(job)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
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
          {jobs.length === 0
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
        isOpen={!!editJob}
        onClose={() => setEditJob(null)}
        title={`Edit: ${editJob?.title}`}
        size="lg"
      >
        {editJob && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Category
                </label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={editForm.category}
                  onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Status</label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                >
                  {JOB_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Timeframe
                </label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={editForm.timeframe}
                  onChange={(e) => setEditForm((f) => ({ ...f, timeframe: e.target.value }))}
                >
                  <option value="asap">ASAP</option>
                  <option value="specific_date">Specific date</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              {editForm.timeframe === "specific_date" && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={editForm.scheduled_date}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, scheduled_date: e.target.value }))
                    }
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Description
              </label>
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                rows={4}
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Photo URLs (one per line)
              </label>
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                rows={3}
                value={editForm.photo_urls_text}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, photo_urls_text: e.target.value }))
                }
                placeholder="https://…"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={() => setEditJob(null)}>
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
        description={`Permanently delete job "${deleteTarget?.title}". This cannot be undone.`}
      />
    </div>
  );
}
