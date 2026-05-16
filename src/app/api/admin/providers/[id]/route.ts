import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-log";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const allowed = [
    "headline",
    "home_city",
    "bio",
    "skills",
    "portfolio_urls",
    "main_category",
    "is_active",
    "is_verified",
    "years_experience",
    "response_time",
    "service_radius_km",
  ];
  const updates: Record<string, unknown> = {};
  for (const field of allowed) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  if (body.hourly_rate !== undefined) {
    updates.hourly_rate = body.hourly_rate === "" ? null : Number(body.hourly_rate);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("provider_profiles")
    .update(updates)
    .eq("user_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    event_type: "admin.provider.updated",
    event_category: "admin",
    actor_id: admin.id,
    actor_email: admin.email,
    actor_role: "admin",
    target_type: "provider",
    target_id: id,
    description: `Admin updated provider ${id}`,
    metadata: { changes: updates },
    request,
  });

  return NextResponse.json({ provider: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("provider_profiles")
    .delete()
    .eq("user_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    event_type: "admin.provider.deleted",
    event_category: "admin",
    actor_id: admin.id,
    actor_email: admin.email,
    actor_role: "admin",
    target_type: "provider",
    target_id: id,
    description: `Admin deleted provider ${id}`,
    request,
  });

  return NextResponse.json({ ok: true });
}
