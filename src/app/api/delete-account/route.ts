import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const {
    data: { user },
    error: userError,
  } = await anonClient.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Delete via admin client (service role key is server-only — no NEXT_PUBLIC_ prefix)
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Log before deletion while we still have the user's details
  await logActivity({
    event_type: "user.deleted",
    event_category: "auth",
    actor_id: user.id,
    actor_email: user.email ?? undefined,
    target_type: "user",
    target_id: user.id,
    description: `Account deleted: ${user.email}`,
    request,
  });

  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
