import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { markConversationRead } from "@/lib/messaging";

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
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await anonClient().auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: conversationId } = await params;

  await markConversationRead(conversationId, user.id);

  return NextResponse.json({ ok: true });
}
