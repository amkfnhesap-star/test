import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const roleFilter = searchParams.get("role") ?? "";
  const hasProviderProfile = searchParams.get("has_provider_profile") ?? "";
  const sortCol = searchParams.get("sort") ?? "created_at";
  const sortDir = searchParams.get("dir") ?? "desc";
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50", 10);

  const validCols = ["full_name", "created_at", "role", "city"];
  const col = validCols.includes(sortCol) ? sortCol : "created_at";

  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, avatar_url, city, phone, bio, role, notification_preferences, created_at")
    .order(col, { ascending: sortDir === "asc" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const { data: providerRows } = await supabaseAdmin.from("provider_profiles").select("user_id");
  const providerIdSet = new Set((providerRows ?? []).map((p: any) => p.user_id));

  let users = (profiles ?? []).map((p: any) => ({
    ...p,
    email: emailMap.get(p.id) ?? "",
    has_provider_profile: providerIdSet.has(p.id),
  }));

  if (search) {
    users = users.filter(
      (u: any) =>
        (u.full_name ?? "").toLowerCase().includes(search) ||
        (u.city ?? "").toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
    );
  }

  if (roleFilter) users = users.filter((u: any) => u.role === roleFilter);

  if (hasProviderProfile === "true") users = users.filter((u: any) => u.has_provider_profile);
  else if (hasProviderProfile === "false") users = users.filter((u: any) => !u.has_provider_profile);

  const total = users.length;
  const paged = users.slice(page * pageSize, (page + 1) * pageSize);

  return NextResponse.json({ users: paged, total });
}
