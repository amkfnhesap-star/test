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

  const { data: jobs, error: jobsError } = await supabaseAdmin
    .from("jobs")
    .select("id, title, client_id, awarded_provider_id")
    .eq("status", "completed")
    .or(`client_id.eq.${user.id},awarded_provider_id.eq.${user.id}`);

  if (jobsError) return NextResponse.json({ error: jobsError.message }, { status: 500 });
  if (!jobs || jobs.length === 0) return NextResponse.json({ pending: [] });

  const jobIds = jobs.map((j) => j.id);
  const { data: myReviews } = await supabaseAdmin
    .from("reviews")
    .select("job_id")
    .eq("reviewer_id", user.id)
    .in("job_id", jobIds);

  const reviewedJobIds = new Set((myReviews ?? []).map((r) => r.job_id));

  const pendingJobs = jobs.filter((j) => !reviewedJobIds.has(j.id));
  if (pendingJobs.length === 0) return NextResponse.json({ pending: [] });

  const otherPartyIds = [
    ...new Set(
      pendingJobs.map((j) =>
        j.client_id === user.id ? j.awarded_provider_id : j.client_id
      ).filter(Boolean)
    ),
  ] as string[];

  let profilesMap: Record<string, { full_name: string; avatar_url: string | null }> = {};
  if (otherPartyIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", otherPartyIds);
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    }
  }

  const pending = pendingJobs.map((j) => {
    const isClient = j.client_id === user.id;
    const direction = isClient ? "client_to_provider" : "provider_to_client";
    const otherPartyId = isClient ? j.awarded_provider_id : j.client_id;
    return {
      job_id: j.id,
      job_title: j.title,
      direction,
      other_party_id: otherPartyId,
      other_party: otherPartyId ? (profilesMap[otherPartyId] ?? null) : null,
      is_client: isClient,
    };
  });

  return NextResponse.json({ pending });
}
