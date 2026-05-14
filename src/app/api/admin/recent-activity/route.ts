import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [jobsRes, providersRes, authResult] = await Promise.all([
    supabaseAdmin
      .from("jobs")
      .select("id, title, client_id, created_at")
      .order("created_at", { ascending: false })
      .limit(7),
    supabaseAdmin
      .from("provider_profiles")
      .select("user_id, headline, created_at")
      .order("created_at", { ascending: false })
      .limit(7),
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const allUsers = authResult.data?.users ?? [];
  const emailMap = new Map(allUsers.map((u) => [u.id, u.email ?? ""]));

  const recentSignups = [...allUsers]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 7)
    .map((u) => ({
      type: "signup" as const,
      timestamp: u.created_at,
      label: u.email ?? u.id,
      email: u.email ?? "",
    }));

  const recentJobs = (jobsRes.data ?? []).map((j) => ({
    type: "job" as const,
    timestamp: j.created_at as string,
    label: j.title as string,
    email: emailMap.get(j.client_id as string) ?? "",
  }));

  const recentProviders = (providersRes.data ?? []).map((p) => ({
    type: "provider" as const,
    timestamp: p.created_at as string,
    label: p.headline as string,
    email: emailMap.get(p.user_id as string) ?? "",
  }));

  const events = [...recentSignups, ...recentJobs, ...recentProviders]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 20);

  return NextResponse.json({ events });
}
