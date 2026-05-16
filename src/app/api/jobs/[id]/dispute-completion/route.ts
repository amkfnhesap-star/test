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

  let body: { reason?: string } = {};
  try {
    body = await request.json();
  } catch {
    // reason is optional
  }

  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select("id, client_id, awarded_provider_id, status, completion_requested_by, title")
    .eq("id", jobId)
    .single();

  if (!job) return NextResponse.json({ error: "Lucrarea nu a fost găsită." }, { status: 404 });

  if (job.status !== "pending_completion") {
    return NextResponse.json(
      { error: "Lucrarea nu este în așteptare confirmare." },
      { status: 409 }
    );
  }

  // Disputer must be the OTHER party — not the one who requested
  if (user.id === job.completion_requested_by) {
    return NextResponse.json(
      { error: "Nu puteți contesta propria cerere de finalizare." },
      { status: 403 }
    );
  }

  const isClient = user.id === job.client_id;
  const isAwardedProvider = user.id === job.awarded_provider_id;
  if (!isClient && !isAwardedProvider) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("jobs")
    .update({
      status: "awarded",
      completion_requested_by: null,
      completion_requested_at: null,
      completion_note: null,
    })
    .eq("id", jobId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await logActivity({
    event_type: "job.completion_disputed",
    event_category: "job",
    actor_id: user.id,
    actor_email: user.email ?? undefined,
    target_type: "job",
    target_id: jobId,
    description: `Completion disputed for job: ${job.title}`,
    metadata: { reason: body.reason ?? null },
    request,
  });

  return NextResponse.json({ ok: true });
}
