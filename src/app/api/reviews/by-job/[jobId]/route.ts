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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await anonClient().auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select("client_id, awarded_provider_id")
    .eq("id", jobId)
    .single();

  if (!job) return NextResponse.json({ error: "Lucrarea nu a fost găsită." }, { status: 404 });
  if (user.id !== job.client_id && user.id !== job.awarded_provider_id) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const { data: allReviews, error } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, comment, created_at, direction, revealed_at, reviewer_id, reviewee_id")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const visible = (allReviews ?? []).filter(
    (r) => r.revealed_at !== null || r.reviewer_id === user.id
  );

  const allPartyIds = [
    ...new Set([
      ...visible.map((r) => r.reviewer_id),
      ...visible.map((r) => r.reviewee_id),
    ]),
  ];

  let profilesMap: Record<string, { full_name: string; avatar_url: string | null }> = {};
  if (allPartyIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", allPartyIds);
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    }
  }

  const enriched = visible.map((r) => ({
    ...r,
    reviewer: profilesMap[r.reviewer_id] ?? null,
    reviewee: profilesMap[r.reviewee_id] ?? null,
  }));

  return NextResponse.json({ reviews: enriched });
}
