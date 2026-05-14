import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const isActiveFilter = searchParams.get("is_active") ?? "";
  const isVerifiedFilter = searchParams.get("is_verified") ?? "";
  const categoryFilter = searchParams.get("category") ?? "";
  const sortCol = searchParams.get("sort") ?? "created_at";
  const sortDir = searchParams.get("dir") ?? "desc";
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50", 10);

  const validCols = ["created_at", "average_rating", "hourly_rate", "jobs_completed", "headline"];
  const col = validCols.includes(sortCol) ? sortCol : "created_at";

  let query = supabaseAdmin
    .from("provider_profiles")
    .select(
      "user_id, headline, main_category, home_city, hourly_rate, is_active, is_verified, average_rating, jobs_completed, service_radius_km, bio, skills, portfolio_urls, years_experience, response_time, created_at, profiles!user_id(full_name, avatar_url)"
    )
    .order(col, { ascending: sortDir === "asc" });

  if (isActiveFilter !== "") query = query.eq("is_active", isActiveFilter === "true");
  if (isVerifiedFilter !== "") query = query.eq("is_verified", isVerifiedFilter === "true");
  if (categoryFilter) query = query.eq("main_category", categoryFilter);

  const { data: providers, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  let merged = (providers ?? []).map((p: any) => ({
    ...p,
    full_name: p.profiles?.full_name ?? "",
    avatar_url: p.profiles?.avatar_url ?? null,
    email: emailMap.get(p.user_id) ?? "",
  }));

  if (search) {
    merged = merged.filter(
      (p: any) =>
        (p.headline ?? "").toLowerCase().includes(search) ||
        (p.home_city ?? "").toLowerCase().includes(search) ||
        (p.full_name ?? "").toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search)
    );
  }

  const total = merged.length;
  const paged = merged.slice(page * pageSize, (page + 1) * pageSize);

  return NextResponse.json({ providers: paged, total });
}
