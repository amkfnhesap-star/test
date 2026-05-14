import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const days = Math.min(parseInt(request.nextUrl.searchParams.get("days") ?? "90"), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [profilesRes, jobsRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("created_at").gte("created_at", since),
    supabaseAdmin.from("jobs").select("created_at").gte("created_at", since),
  ]);

  const now = new Date();
  const dateMap = new Map<string, { date: string; signups: number; jobs: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dateMap.set(key, { date: key, signups: 0, jobs: 0 });
  }

  for (const p of profilesRes.data ?? []) {
    const key = (p.created_at as string).slice(0, 10);
    const entry = dateMap.get(key);
    if (entry) entry.signups++;
  }
  for (const j of jobsRes.data ?? []) {
    const key = (j.created_at as string).slice(0, 10);
    const entry = dateMap.get(key);
    if (entry) entry.jobs++;
  }

  return NextResponse.json({ timeseries: Array.from(dateMap.values()) });
}
