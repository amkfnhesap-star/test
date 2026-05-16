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

  await logActivity({
    event_type: "user.login",
    event_category: "auth",
    actor_id: user.id,
    actor_email: user.email ?? undefined,
    actor_role: (profile?.role as string | undefined) ?? undefined,
    target_type: "user",
    target_id: user.id,
    description: `User logged in: ${user.email}`,
    request,
  });

  return NextResponse.json({ ok: true });
}
