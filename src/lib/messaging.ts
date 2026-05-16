import { supabaseAdmin } from "./supabase-admin";

export function sortUserIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  user_a_id: string;
  user_b_id: string;
  context_type: "job" | "provider";
  context_job_id: string | null;
  context_provider_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender_id: string | null;
  deleted_by_a: boolean;
  deleted_by_b: boolean;
  deleted_at_a: string | null;
  deleted_at_b: string | null;
}

export interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  photo_url: string | null;
  read_at: string | null;
}

export async function getOrCreateConversation(params: {
  currentUserId: string;
  otherUserId: string;
  contextType: "job" | "provider";
  contextJobId?: string;
  contextProviderId?: string;
}): Promise<{ conversation: Conversation | null; error?: string }> {
  const { currentUserId, otherUserId, contextType, contextJobId, contextProviderId } = params;
  const [user_a_id, user_b_id] = sortUserIds(currentUserId, otherUserId);

  let query = supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("user_a_id", user_a_id)
    .eq("user_b_id", user_b_id);

  if (contextType === "job") {
    query = query.eq("context_job_id", contextJobId!);
  } else {
    query = query.eq("context_provider_id", contextProviderId!);
  }

  const { data: existing, error: selectError } = await query.maybeSingle();
  if (selectError) return { conversation: null, error: selectError.message };

  if (existing) {
    const isUserA = currentUserId === user_a_id;
    await supabaseAdmin
      .from("conversations")
      .update(isUserA ? { deleted_by_a: false } : { deleted_by_b: false })
      .eq("id", existing.id);
    return { conversation: existing };
  }

  const { data: created, error: insertError } = await supabaseAdmin
    .from("conversations")
    .insert({
      user_a_id,
      user_b_id,
      context_type: contextType,
      context_job_id: contextJobId ?? null,
      context_provider_id: contextProviderId ?? null,
    })
    .select()
    .single();

  if (insertError) return { conversation: null, error: insertError.message };
  return { conversation: created };
}

export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  body?: string;
  photoUrl?: string;
}): Promise<{ message: Message | null; error?: string }> {
  const { conversationId, senderId, body, photoUrl } = params;
  if (!body && !photoUrl) return { message: null, error: "Message must have body or photo" };

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: body ?? null,
      photo_url: photoUrl ?? null,
    })
    .select()
    .single();

  if (error) return { message: null, error: error.message };
  return { message: data };
}

export async function markConversationRead(
  conversationId: string,
  currentUserId: string
): Promise<void> {
  await supabaseAdmin
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", currentUserId)
    .is("read_at", null);
}

export async function getUnreadCount(currentUserId: string): Promise<number> {
  const { data: convs } = await supabaseAdmin
    .from("conversations")
    .select("id, user_a_id, deleted_by_a, deleted_by_b")
    .or(`user_a_id.eq.${currentUserId},user_b_id.eq.${currentUserId}`);

  if (!convs || convs.length === 0) return 0;

  const activeIds = convs
    .filter((c) => (c.user_a_id === currentUserId ? !c.deleted_by_a : !c.deleted_by_b))
    .map((c) => c.id);

  if (activeIds.length === 0) return 0;

  const { count } = await supabaseAdmin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", activeIds)
    .neq("sender_id", currentUserId)
    .is("read_at", null);

  return count ?? 0;
}
