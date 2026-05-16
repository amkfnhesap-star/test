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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await anonClient().auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: conversationId } = await params;

  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("id, user_a_id, user_b_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  if (conv.user_a_id !== user.id && conv.user_b_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isUserA = conv.user_a_id === user.id;
  const update = isUserA
    ? { deleted_by_a: true, deleted_at_a: new Date().toISOString() }
    : { deleted_by_b: true, deleted_at_b: new Date().toISOString() };

  const { error } = await supabaseAdmin
    .from("conversations")
    .update(update)
    .eq("id", conversationId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
