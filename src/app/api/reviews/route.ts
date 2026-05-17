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

export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await anonClient().auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { job_id?: string; rating?: number; comment?: string; direction?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { job_id, rating, direction, comment } = body;

  if (!job_id || rating == null || !direction) {
    return NextResponse.json({ error: "job_id, rating, and direction are required" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be an integer 1–5" }, { status: 400 });
  }
  if (direction !== "client_to_provider" && direction !== "provider_to_client") {
    return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
  }

  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select("id, client_id, awarded_provider_id, status, title")
    .eq("id", job_id)
    .single();

  if (!job) return NextResponse.json({ error: "Lucrarea nu a fost găsită." }, { status: 404 });
  if (job.status !== "completed") {
    return NextResponse.json({ error: "Lucrarea nu este finalizată." }, { status: 400 });
  }

  let reviewee_id: string;
  if (direction === "client_to_provider") {
    if (user.id !== job.client_id) {
      return NextResponse.json({ error: "Doar clientul poate recenza meșterul." }, { status: 403 });
    }
    if (!job.awarded_provider_id) {
      return NextResponse.json({ error: "Nicio acordare găsită." }, { status: 400 });
    }
    reviewee_id = job.awarded_provider_id;
  } else {
    if (user.id !== job.awarded_provider_id) {
      return NextResponse.json({ error: "Doar meșterul poate recenza clientul." }, { status: 403 });
    }
    reviewee_id = job.client_id;
  }

  const trimmedComment = comment?.trim() || null;

  const { data: review, error: insertError } = await supabaseAdmin
    .from("reviews")
    .insert({
      job_id,
      reviewer_id: user.id,
      reviewee_id,
      direction,
      rating,
      comment: trimmedComment,
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Ai deja o recenzie pentru această lucrare." }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await logActivity({
    event_type: "review.submitted",
    event_category: "review",
    actor_id: user.id,
    actor_email: user.email ?? undefined,
    target_type: "user",
    target_id: reviewee_id,
    description: `Review submitted: ${direction} for job ${job.title}`,
    metadata: { job_id, direction, rating },
    request,
  });

  return NextResponse.json({ review });
}
