import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)));
  const event_category = searchParams.get("event_category") ?? "";
  const event_type = searchParams.get("event_type") ?? "";
  const actor_email = searchParams.get("actor_email") ?? "";
  const target_type = searchParams.get("target_type") ?? "";
  const target_id = searchParams.get("target_id") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const search = searchParams.get("search") ?? "";

  let query = supabaseAdmin
    .from("activity_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  // Support comma-separated categories for multi-select
  if (event_category) {
    const cats = event_category.split(",").filter(Boolean);
    if (cats.length === 1) {
      query = query.eq("event_category", cats[0]);
    } else if (cats.length > 1) {
      query = query.in("event_category", cats);
    }
  }
  if (event_type) query = query.eq("event_type", event_type);
  if (actor_email) query = query.ilike("actor_email", `%${actor_email}%`);
  if (target_type) query = query.eq("target_type", target_type);
  if (target_id) query = query.eq("target_id", target_id);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);
  if (search) query = query.ilike("description", `%${search}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ rows: data ?? [], total: count ?? 0, page, limit });
}
