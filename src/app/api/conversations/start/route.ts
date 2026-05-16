import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateConversation } from "@/lib/messaging";
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { otherUserId, contextType, contextJobId, contextProviderId } = body as {
    otherUserId?: string;
    contextType?: string;
    contextJobId?: string;
    contextProviderId?: string;
  };

  if (!otherUserId || !contextType) {
    return NextResponse.json({ error: "otherUserId and contextType are required" }, { status: 400 });
  }
  if (otherUserId === user.id) {
    return NextResponse.json({ error: "Cannot start a conversation with yourself" }, { status: 400 });
  }
  if (contextType !== "job" && contextType !== "provider") {
    return NextResponse.json({ error: "contextType must be 'job' or 'provider'" }, { status: 400 });
  }

  // Validate context and confirm otherUserId is the correct participant
  if (contextType === "job") {
    if (!contextJobId) return NextResponse.json({ error: "contextJobId is required for job context" }, { status: 400 });
    const { data: job } = await supabaseAdmin
      .from("jobs")
      .select("id, client_id")
      .eq("id", contextJobId)
      .single();
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.client_id !== otherUserId) {
      return NextResponse.json({ error: "otherUserId must be the job's client" }, { status: 400 });
    }
  } else {
    if (!contextProviderId) {
      return NextResponse.json({ error: "contextProviderId is required for provider context" }, { status: 400 });
    }
    const { data: provider } = await supabaseAdmin
      .from("provider_profiles")
      .select("user_id")
      .eq("user_id", contextProviderId)
      .single();
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    if (provider.user_id !== otherUserId) {
      return NextResponse.json({ error: "otherUserId must be the provider's user" }, { status: 400 });
    }
  }

  const { conversation, error } = await getOrCreateConversation({
    currentUserId: user.id,
    otherUserId,
    contextType: contextType as "job" | "provider",
    contextJobId,
    contextProviderId,
  });

  if (error || !conversation) {
    return NextResponse.json({ error: error ?? "Failed to create conversation" }, { status: 500 });
  }

  await logActivity({
    event_type: "conversation.started",
    event_category: "message",
    actor_id: user.id,
    actor_email: user.email ?? undefined,
    target_type: "conversation",
    target_id: conversation.id,
    description: `Conversation started with ${otherUserId}`,
    metadata: { contextType, contextJobId, contextProviderId },
    request,
  });

  return NextResponse.json({ conversationId: conversation.id });
}
