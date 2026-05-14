import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

function trendPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersRes,
    providersRes,
    jobsRes,
    jobFavsRes,
    provFavsRes,
    signupsRes,
    newJobsRes,
    usersCurrent,
    providersCurrent,
    jobsCurrent,
    jobFavsCurrent,
    provFavsCurrent,
    usersPrev,
    providersPrev,
    jobsPrev,
    jobFavsPrev,
    provFavsPrev,
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("provider_profiles").select("user_id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabaseAdmin.from("job_favorites").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("provider_favorites").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabaseAdmin.from("jobs").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    // Current period (last 30 days)
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabaseAdmin.from("provider_profiles").select("user_id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabaseAdmin.from("jobs").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabaseAdmin.from("job_favorites").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabaseAdmin.from("provider_favorites").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    // Previous period (30-60 days ago)
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
    supabaseAdmin.from("provider_profiles").select("user_id", { count: "exact", head: true }).gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
    supabaseAdmin.from("jobs").select("id", { count: "exact", head: true }).gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
    supabaseAdmin.from("job_favorites").select("id", { count: "exact", head: true }).gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
    supabaseAdmin.from("provider_favorites").select("id", { count: "exact", head: true }).gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
  ]);

  const currentFavs = (jobFavsCurrent.count ?? 0) + (provFavsCurrent.count ?? 0);
  const prevFavs = (jobFavsPrev.count ?? 0) + (provFavsPrev.count ?? 0);

  return NextResponse.json({
    totalUsers: usersRes.count ?? 0,
    totalActiveProviders: providersRes.count ?? 0,
    totalOpenJobs: jobsRes.count ?? 0,
    totalFavorites: (jobFavsRes.count ?? 0) + (provFavsRes.count ?? 0),
    signupsThisWeek: signupsRes.count ?? 0,
    jobsThisWeek: newJobsRes.count ?? 0,
    users_trend_pct: trendPct(usersCurrent.count ?? 0, usersPrev.count ?? 0),
    providers_trend_pct: trendPct(providersCurrent.count ?? 0, providersPrev.count ?? 0),
    jobs_trend_pct: trendPct(jobsCurrent.count ?? 0, jobsPrev.count ?? 0),
    favorites_trend_pct: trendPct(currentFavs, prevFavs),
  });
}
