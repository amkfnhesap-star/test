import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const statusFilter = searchParams.get("status") ?? "";
  const categoryFilter = searchParams.get("category") ?? "";
  const hasPhotos = searchParams.get("has_photos") ?? "";
  const sortCol = searchParams.get("sort") ?? "created_at";
  const sortDir = searchParams.get("dir") ?? "desc";
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50", 10);

  const validCols = ["created_at", "budget", "status", "category", "title"];
  const col = validCols.includes(sortCol) ? sortCol : "created_at";

  let query = supabaseAdmin
    .from("jobs")
    .select(
      "id, title, category, city, budget, status, client_id, photo_urls, description, timeframe, scheduled_date, created_at, profiles!client_id(full_name)"
    )
    .order(col, { ascending: sortDir === "asc" });

  if (statusFilter) query = query.eq("status", statusFilter);
  if (categoryFilter) query = query.eq("category", categoryFilter);

  const { data: jobs, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  let merged = (jobs ?? []).map((j: any) => ({
    ...j,
    poster_name: j.profiles?.full_name ?? "",
    poster_email: emailMap.get(j.client_id) ?? "",
    photos_count: Array.isArray(j.photo_urls) ? j.photo_urls.length : 0,
  }));

  if (search) {
    merged = merged.filter(
      (j: any) =>
        (j.title ?? "").toLowerCase().includes(search) ||
        (j.description ?? "").toLowerCase().includes(search) ||
        (j.city ?? "").toLowerCase().includes(search)
    );
  }

  if (hasPhotos === "true") merged = merged.filter((j: any) => j.photos_count > 0);
  else if (hasPhotos === "false") merged = merged.filter((j: any) => j.photos_count === 0);

  const total = merged.length;
  const paged = merged.slice(page * pageSize, (page + 1) * pageSize);

  return NextResponse.json({ jobs: paged, total });
}
