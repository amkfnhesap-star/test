import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendMessage } from "@/lib/messaging";
import { logActivity } from "@/lib/activity-log";

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getAuthedUser(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user } } = await anonClient().auth.getUser(token);
  return user ?? null;
}

async function assertParticipant(conversationId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("conversations")
    .select("id, user_a_id, user_b_id")
    .eq("id", conversationId)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .maybeSingle();
  return !!data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: conversationId } = await params;

  const isParticipant = await assertParticipant(conversationId, user.id);
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const before = url.searchParams.get("before"); // message id
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 100);

  let query = supabaseAdmin
    .from("messages")
    .select("id, created_at, conversation_id, sender_id, body, photo_url, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (before) {
    // Get the cursor message's created_at
    const { data: cursor } = await supabaseAdmin
      .from("messages")
      .select("created_at")
      .eq("id", before)
      .single();
    if (cursor) {
      query = query.lt("created_at", cursor.created_at);
    }
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const messages = rows.slice(0, limit).reverse(); // oldest first for display

  return NextResponse.json({ messages, hasMore });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: conversationId } = await params;

  const isParticipant = await assertParticipant(conversationId, user.id);
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { body: text, photoUrl } = body as { body?: string; photoUrl?: string };

  if (!text?.trim() && !photoUrl) {
    return NextResponse.json({ error: "body or photoUrl is required" }, { status: 400 });
  }

  const { message, error } = await sendMessage({
    conversationId,
    senderId: user.id,
    body: text?.trim() || undefined,
    photoUrl: photoUrl || undefined,
  });

  if (error || !message) {
    return NextResponse.json({ error: error ?? "Failed to send message" }, { status: 500 });
  }

  await logActivity({
    event_type: "message.sent",
    event_category: "message",
    actor_id: user.id,
    actor_email: user.email ?? undefined,
    target_type: "conversation",
    target_id: conversationId,
    description: "Message sent",
    metadata: { has_photo: !!photoUrl },
    request,
  });

  return NextResponse.json({ message });
}
