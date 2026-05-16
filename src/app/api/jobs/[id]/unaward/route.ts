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

  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select("id, client_id, status, title")
    .eq("id", jobId)
    .single();

  if (!job) return NextResponse.json({ error: "Lucrarea nu a fost găsită." }, { status: 404 });
  if (job.client_id !== user.id) {
    return NextResponse.json({ error: "Doar clientul poate anula acordarea." }, { status: 403 });
  }
  if (job.status !== "awarded") {
    return NextResponse.json(
      { error: "Nu se poate anula acordarea — lucrarea nu este în starea 'acordată'." },
      { status: 409 }
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("jobs")
    .update({
      awarded_provider_id: null,
      awarded_at: null,
      status: "open",
    })
    .eq("id", jobId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await logActivity({
    event_type: "job.unawarded",
    event_category: "job",
    actor_id: user.id,
    actor_email: user.email ?? undefined,
    target_type: "job",
    target_id: jobId,
    description: `Job unawarded: ${job.title}`,
    request,
  });

  return NextResponse.json({ ok: true });
}
