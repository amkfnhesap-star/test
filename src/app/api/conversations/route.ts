import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface ConvRow {
  id: string;
  context_type: string;
  context_job_id: string | null;
  context_provider_id: string | null;
  user_a_id: string;
  user_b_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender_id: string | null;
  deleted_by_a: boolean;
  deleted_by_b: boolean;
}

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await anonClient().auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.id;

  // Fetch all conversations where user is a participant
  const { data: rawConvs, error: convErr } = await supabaseAdmin
    .from("conversations")
    .select(
      "id, context_type, context_job_id, context_provider_id, user_a_id, user_b_id, " +
      "last_message_at, last_message_preview, last_message_sender_id, " +
      "deleted_by_a, deleted_by_b"
    )
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  const convs = rawConvs as ConvRow[] | null;

  if (convErr) return NextResponse.json({ error: convErr.message }, { status: 500 });

  // Filter out soft-deleted conversations for this user
  const active = (convs ?? []).filter((c) =>
    c.user_a_id === userId ? !c.deleted_by_a : !c.deleted_by_b
  );

  if (active.length === 0) return NextResponse.json({ conversations: [] });

  const convIds = active.map((c) => c.id);
  const otherUserIds = [...new Set(active.map((c) =>
    c.user_a_id === userId ? c.user_b_id : c.user_a_id
  ))];
  const jobIds = active.filter((c) => c.context_job_id).map((c) => c.context_job_id as string);
  const providerIds = active.filter((c) => c.context_provider_id).map((c) => c.context_provider_id as string);

  // Parallel fetches
  const [profilesRes, jobsRes, providersRes, unreadRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", otherUserIds),
    jobIds.length
      ? supabaseAdmin.from("jobs").select("id, title").in("id", jobIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    providerIds.length
      ? supabaseAdmin.from("provider_profiles").select("user_id, headline").in("user_id", providerIds)
      : Promise.resolve({ data: [] as { user_id: string; headline: string }[] }),
    supabaseAdmin
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", convIds)
      .neq("sender_id", userId)
      .is("read_at", null),
  ]);

  const profileMap = Object.fromEntries(
    (profilesRes.data ?? []).map((p) => [p.id, p])
  );
  const jobMap = Object.fromEntries(
    (jobsRes.data ?? []).map((j) => [j.id, j])
  );
  const providerMap = Object.fromEntries(
    (providersRes.data ?? []).map((p) => [p.user_id, p])
  );

  // Count unread per conversation
  const unreadCounts = (unreadRes.data ?? []).reduce<Record<string, number>>(
    (acc, m) => {
      acc[m.conversation_id] = (acc[m.conversation_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const conversations = active.map((c) => {
    const otherUserId = c.user_a_id === userId ? c.user_b_id : c.user_a_id;
    const otherUser = profileMap[otherUserId] ?? null;
    const contextTitle =
      c.context_type === "job"
        ? jobMap[c.context_job_id ?? ""]?.title ?? null
        : providerMap[c.context_provider_id ?? ""]?.headline ?? null;

    return {
      id: c.id,
      context_type: c.context_type,
      context_job_id: c.context_job_id,
      context_provider_id: c.context_provider_id,
      last_message_at: c.last_message_at,
      last_message_preview: c.last_message_preview,
      last_message_sender_id: c.last_message_sender_id,
      other_user: otherUser,
      context_title: contextTitle,
      unread_count: unreadCounts[c.id] ?? 0,
    };
  });

  return NextResponse.json({ conversations });
}
