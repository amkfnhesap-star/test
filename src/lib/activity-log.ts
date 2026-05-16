import { createClient } from "@supabase/supabase-js";

function getLogClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface ActivityLogParams {
  event_type: string;
  event_category: string;
  actor_id?: string;
  actor_email?: string;
  actor_role?: string;
  target_type?: string;
  target_id?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  request?: Request | { headers: { get(name: string): string | null } };
}

export function getRequestMeta(
  request: Request | { headers: { get(name: string): string | null } }
): { ip_address: string | null; user_agent: string | null } {
  const fwd = request.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0].trim() : (request.headers.get("x-real-ip") ?? null);
  const user_agent = request.headers.get("user-agent");
  return { ip_address: ip, user_agent };
}

export async function logActivity(params: ActivityLogParams): Promise<void> {
  try {
    const { request, ...rest } = params;
    const meta = request ? getRequestMeta(request) : { ip_address: null, user_agent: null };

    await getLogClient()
      .from("activity_logs")
      .insert({
        event_type: rest.event_type,
        event_category: rest.event_category,
        actor_id: rest.actor_id ?? null,
        actor_email: rest.actor_email ?? null,
        actor_role: rest.actor_role ?? null,
        target_type: rest.target_type ?? null,
        target_id: rest.target_id ?? null,
        description: rest.description ?? null,
        metadata: rest.metadata ?? {},
        ...meta,
      });
  } catch (err) {
    console.error("[activity-log] Failed to log activity:", err);
  }
}
