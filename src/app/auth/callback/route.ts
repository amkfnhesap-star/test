import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` lets the signup flow steer the post-verification redirect
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const {
      data: { session },
    } = await supabase.auth.exchangeCodeForSession(code);

    if (session?.user) {
      const user = session.user;
      const ageMs = Date.now() - new Date(user.created_at).getTime();
      if (ageMs < 60_000) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name, city, role")
          .eq("id", user.id)
          .single();

        await logActivity({
          event_type: "user.signup",
          event_category: "auth",
          actor_id: user.id,
          actor_email: user.email ?? undefined,
          actor_role: (profile?.role as string | undefined) ?? undefined,
          target_type: "user",
          target_id: user.id,
          description: `User signed up: ${user.email}`,
          metadata: {
            full_name: profile?.full_name ?? null,
            city: profile?.city ?? null,
          },
          request,
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
