import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user } } = await anonClient().auth.getUser(token);
  if (!user) return null;
  if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "0");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "100");
  const directionFilter = searchParams.get("direction") ?? "";
  const revealedFilter = searchParams.get("revealed") ?? "";

  let query = supabaseAdmin
    .from("reviews")
    .select(
      "id, rating, comment, created_at, direction, revealed_at, reviewer_id, reviewee_id, job_id",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (directionFilter) query = query.eq("direction", directionFilter);
  if (revealedFilter === "true") query = query.not("revealed_at", "is", null);
  if (revealedFilter === "false") query = query.is("revealed_at", null);

  const { data: reviews, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = reviews ?? [];
  const allIds = [
    ...new Set([...list.map((r) => r.reviewer_id), ...list.map((r) => r.reviewee_id)]),
  ];
  const allJobIds = [...new Set(list.map((r) => r.job_id))];

  let profilesMap: Record<string, { full_name: string; avatar_url: string | null }> = {};
  let jobsMap: Record<string, { title: string }> = {};

  await Promise.all([
    allIds.length > 0
      ? supabaseAdmin
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", allIds)
          .then(({ data }) => {
            if (data) profilesMap = Object.fromEntries(data.map((p) => [p.id, p]));
          })
      : Promise.resolve(),
    allJobIds.length > 0
      ? supabaseAdmin
          .from("jobs")
          .select("id, title")
          .in("id", allJobIds)
          .then(({ data }) => {
            if (data) jobsMap = Object.fromEntries(data.map((j) => [j.id, j]));
          })
      : Promise.resolve(),
  ]);

  const enriched = list.map((r) => ({
    ...r,
    reviewer: profilesMap[r.reviewer_id] ?? null,
    reviewee: profilesMap[r.reviewee_id] ?? null,
    job: jobsMap[r.job_id] ?? null,
  }));

  return NextResponse.json({ reviews: enriched, total: count ?? 0 });
}
