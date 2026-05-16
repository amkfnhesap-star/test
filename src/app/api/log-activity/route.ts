import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logActivity } from "@/lib/activity-log";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ ok: true });

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const {
    data: { user },
  } = await anonClient.auth.getUser(token);
  if (!user) return NextResponse.json({ ok: true });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const { event_type, event_category, target_type, target_id, description, metadata } =
    body as {
      event_type?: string;
      event_category?: string;
      target_type?: string;
      target_id?: string;
      description?: string;
      metadata?: Record<string, unknown>;
    };

  if (!event_type || !event_category) return NextResponse.json({ ok: true });

  await logActivity({
    event_type,
    event_category,
    actor_id: user.id,
    actor_email: user.email ?? undefined,
    actor_role: (profile?.role as string | undefined) ?? undefined,
    target_type,
    target_id: target_id != null ? String(target_id) : undefined,
    description,
    metadata,
    request,
  });

  return NextResponse.json({ ok: true });
}
