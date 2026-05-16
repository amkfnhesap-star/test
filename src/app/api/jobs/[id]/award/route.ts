import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await anonClient().auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { provider_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { provider_id } = body;
  if (!provider_id) {
    return NextResponse.json({ error: "provider_id is required" }, { status: 400 });
  }
  if (provider_id === user.id) {
    return NextResponse.json({ error: "Nu poți acorda lucrarea ție însuți." }, { status: 400 });
  }

  // Fetch the job
  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select("id, client_id, status, awarded_provider_id, title")
    .eq("id", jobId)
    .single();

  if (!job) return NextResponse.json({ error: "Lucrarea nu a fost găsită." }, { status: 404 });
  if (job.client_id !== user.id) {
    return NextResponse.json({ error: "Doar clientul poate acorda lucrarea." }, { status: 403 });
  }
  if (job.status !== "open") {
    return NextResponse.json({ error: "Lucrarea nu mai este deschisă." }, { status: 409 });
  }
  if (job.awarded_provider_id) {
    return NextResponse.json({ error: "Lucrarea a fost deja acordată." }, { status: 409 });
  }

  // Verify the provider exists
  const { data: provider } = await supabaseAdmin
    .from("provider_profiles")
    .select("user_id")
    .eq("user_id", provider_id)
    .single();

  if (!provider) {
    return NextResponse.json({ error: "Meșterul nu a fost găsit." }, { status: 404 });
  }

  // Award the job
  const { error: updateError } = await supabaseAdmin
    .from("jobs")
    .update({
      awarded_provider_id: provider_id,
      awarded_at: new Date().toISOString(),
      status: "awarded",
    })
    .eq("id", jobId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await logActivity({
    event_type: "job.awarded",
    event_category: "job",
    actor_id: user.id,
    actor_email: user.email ?? undefined,
    target_type: "job",
    target_id: jobId,
    description: `Job awarded: ${job.title}`,
    metadata: { provider_id },
    request,
  });

  return NextResponse.json({ ok: true });
}
