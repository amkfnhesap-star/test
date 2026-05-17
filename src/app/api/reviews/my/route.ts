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

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await anonClient().auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [receivedRes, givenRes] = await Promise.all([
    supabaseAdmin
      .from("reviews")
      .select("id, rating, comment, created_at, direction, revealed_at, reviewer_id, job_id")
      .eq("reviewee_id", user.id)
      .not("revealed_at", "is", null)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("reviews")
      .select("id, rating, comment, created_at, direction, revealed_at, reviewee_id, job_id")
      .eq("reviewer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const received = receivedRes.data ?? [];
  const given = givenRes.data ?? [];

  const allIds = [
    ...new Set([
      ...received.map((r) => r.reviewer_id),
      ...given.map((r) => r.reviewee_id),
    ]),
  ];

  const allJobIds = [
    ...new Set([
      ...received.map((r) => r.job_id),
      ...given.map((r) => r.job_id),
    ]),
  ];

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

  const enrichedReceived = received.map((r) => ({
    ...r,
    other_party: profilesMap[r.reviewer_id] ?? null,
    job: jobsMap[r.job_id] ?? null,
  }));

  const enrichedGiven = given.map((r) => ({
    ...r,
    other_party: profilesMap[r.reviewee_id] ?? null,
    job: jobsMap[r.job_id] ?? null,
  }));

  return NextResponse.json({ received: enrichedReceived, given: enrichedGiven });
}
