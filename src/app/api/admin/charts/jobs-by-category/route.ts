import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin.from("jobs").select("category");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const countMap = new Map<string, number>();
  for (const job of data ?? []) {
    countMap.set(job.category, (countMap.get(job.category) ?? 0) + 1);
  }

  const result = Array.from(countMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ categories: result });
}
