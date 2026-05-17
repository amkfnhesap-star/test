import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { providerId } = await params;

  const { data: reviews, error } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_id")
    .eq("reviewee_id", providerId)
    .eq("direction", "client_to_provider")
    .not("revealed_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = reviews ?? [];

  const reviewerIds = [...new Set(list.map((r) => r.reviewer_id))];
  let profilesMap: Record<string, { full_name: string; avatar_url: string | null }> = {};
  if (reviewerIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", reviewerIds);
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    }
  }

  const enriched = list.map((r) => ({
    ...r,
    reviewer: profilesMap[r.reviewer_id] ?? null,
  }));

  const count = enriched.length;
  const average_rating =
    count > 0 ? enriched.reduce((s, r) => s + r.rating, 0) / count : 0;

  return NextResponse.json({ reviews: enriched, count, average_rating });
}
