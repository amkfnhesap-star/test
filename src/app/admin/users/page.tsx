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
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";

type AdminUser = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  city: string | null;
  phone: string | null;
  bio: string | null;
  notification_preferences: {
    job_responses: boolean;
    platform_updates: boolean;
    marketing: boolean;
  } | null;
  avatar_url: string | null;
  has_provider_profile: boolean;
  created_at: string;
};

const PAGE_SIZE = 100;

export default function AdminUsersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [hasProviderFilter, setHasProviderFilter] = useState("");
  const [sort, setSort] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<{
    role: string;
    bio: string;
    notification_preferences: {
      job_responses: boolean;
      platform_updates: boolean;
      marketing: boolean;
    };
  }>({
    role: "customer",
    bio: "",
    notification_preferences: { job_responses: true, platform_updates: true, marketing: false },
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
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
  }, [roleFilter, hasProviderFilter, sort, sortDir]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({
        search: debouncedSearch,
        role: roleFilter,
        has_provider_profile: hasProviderFilter,
        sort,
        dir: sortDir,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/users?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, roleFilter, hasProviderFilter, sort, sortDir, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleSort = (col: string) => {
    if (sort === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(col);
      setSortDir("desc");
    }
  };

  const patchUser = async (
    user: AdminUser,
    field: string,
    value: unknown
  ) => {
    const original = (user as Record<string, unknown>)[field];
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, [field]: value } : u)));
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, [field]: original } : u)));
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditForm({
      role: user.role,
      bio: user.bio ?? "",
      notification_preferences: user.notification_preferences ?? {
        job_responses: true,
        platform_updates: true,
        marketing: false,
      },
    });
  };

  const saveEdit = async () => {
    if (!editUser || !token) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editUser.id ? { ...u, ...editForm } : u))
        );
        setEditUser(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
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

  const roleBadge = (role: string) =>
    role === "admin" ? "purple" : role === "provider" ? "info" : "default";

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-zinc-400 text-sm mt-0.5">{total.toLocaleString()} total</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
        <input
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Search by name, email, or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {(["", "customer", "provider", "admin"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              roleFilter === r
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700"
            }`}
          >
            {r === "" ? "All roles" : r[0].toUpperCase() + r.slice(1)}
          </button>
        ))}
        <div className="w-px bg-zinc-700 self-stretch mx-0.5" />
        {(
          [
            ["", "Any profile"],
            ["true", "Has provider"],
            ["false", "No provider"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setHasProviderFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              hasProviderFilter === v
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
              <th className="w-10 px-4 py-1.5" />
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="full_name" label="Name" />
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Email
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <SortBtn col="role" label="Role" />
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                City
              </th>
              <th className="px-4 py-1.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Phone
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
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-1.5">
                      <div
                        className="h-4 bg-zinc-800 rounded animate-pulse"
                        style={{ width: j === 0 ? "32px" : "80%" }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-violet-500/[0.05] transition-colors">
                  <td className="px-4 py-1.5">
                    <Avatar
                      name={user.full_name ?? user.email}
                      src={user.avatar_url ?? undefined}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-1.5 font-medium text-white">
                    <InlineEdit
                      value={user.full_name}
                      onSave={(v) => patchUser(user, "full_name", v || null)}
                    />
                  </td>
                  <td className="px-4 py-1.5 text-zinc-300 font-mono text-xs">{user.email}</td>
                  <td className="px-4 py-1.5">
                    <Badge variant={roleBadge(user.role) as any}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-1.5 text-zinc-300">
                    <InlineEdit
                      value={user.city}
                      onSave={(v) => patchUser(user, "city", v || null)}
                    />
                  </td>
                  <td className="px-4 py-1.5 text-zinc-300">
                    <InlineEdit
                      value={user.phone}
                      onSave={(v) => patchUser(user, "phone", v || null)}
                    />
                  </td>
                  <td className="px-4 py-1.5 text-zinc-400 whitespace-nowrap text-xs">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-zinc-400">
        <span>
          {users.length === 0
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
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Edit: ${editUser?.full_name ?? editUser?.email}`}
        size="md"
      >
        {editUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Role</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="customer">Customer</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Bio</label>
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="User bio…"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">
                Notification Preferences
              </label>
              <div className="space-y-2">
                {(
                  [
                    ["job_responses", "Job responses"],
                    ["platform_updates", "Platform updates"],
                    ["marketing", "Marketing emails"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2.5 text-sm text-zinc-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="accent-brand-500 w-4 h-4"
                      checked={editForm.notification_preferences[key]}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          notification_preferences: {
                            ...f.notification_preferences,
                            [key]: e.target.checked,
                          },
                        }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={() => setEditUser(null)}>
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
        description={`Permanently delete "${
          deleteTarget?.full_name ?? deleteTarget?.email
        }" and their auth account. This cannot be undone.`}
      />
    </div>
  );
}
