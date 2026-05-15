import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const allowed = [
    "title",
    "city",
    "description",
    "category",
    "status",
    "timeframe",
    "scheduled_date",
    "photo_urls",
  ];
  const updates: Record<string, unknown> = {};
  for (const field of allowed) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  if (body.budget !== undefined) {
    updates.budget = body.budget === "" ? null : Number(body.budget);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ job: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { error } = await supabaseAdmin.from("jobs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
