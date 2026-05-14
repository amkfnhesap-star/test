import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const typeFilter = searchParams.get("type") ?? "";
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50", 10);

  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const { data: profileRows } = await supabaseAdmin.from("profiles").select("id, full_name");
  const nameMap = new Map((profileRows ?? []).map((p: any) => [p.id, p.full_name ?? ""]));

  let jobFavs: any[] = [];
  let provFavs: any[] = [];

  if (!typeFilter || typeFilter === "job") {
    const { data } = await supabaseAdmin
      .from("job_favorites")
      .select("user_id, job_id, created_at, jobs!job_id(title)")
      .order("created_at", { ascending: false });

    jobFavs = (data ?? []).map((f: any) => ({
      id: `job:${f.user_id}:${f.job_id}`,
      type: "job",
      user_id: f.user_id,
      target_id: f.job_id,
      user_name: nameMap.get(f.user_id) ?? "",
      user_email: emailMap.get(f.user_id) ?? "",
      target_title: f.jobs?.title ?? "",
      created_at: f.created_at,
    }));
  }

  if (!typeFilter || typeFilter === "provider") {
    const { data } = await supabaseAdmin
      .from("provider_favorites")
      .select("user_id, provider_id, created_at, provider_profiles!provider_id(headline)")
      .order("created_at", { ascending: false });

    provFavs = (data ?? []).map((f: any) => ({
      id: `provider:${f.user_id}:${f.provider_id}`,
      type: "provider",
      user_id: f.user_id,
      target_id: f.provider_id,
      user_name: nameMap.get(f.user_id) ?? "",
      user_email: emailMap.get(f.user_id) ?? "",
      target_title: f.provider_profiles?.headline ?? "",
      created_at: f.created_at,
    }));
  }

  let favorites = [...jobFavs, ...provFavs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (search) {
    favorites = favorites.filter(
      (f) =>
        f.user_email.toLowerCase().includes(search) ||
        f.user_name.toLowerCase().includes(search) ||
        f.target_title.toLowerCase().includes(search)
    );
  }

  const total = favorites.length;
  const paged = favorites.slice(page * pageSize, (page + 1) * pageSize);

  return NextResponse.json({ favorites: paged, total });
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const userId = searchParams.get("user_id");
  const targetId = searchParams.get("target_id");

  if (!type || !userId || !targetId) {
    return NextResponse.json(
      { error: "Required params: type, user_id, target_id" },
      { status: 400 }
    );
  }

  if (type === "job") {
    const { error } = await supabaseAdmin
      .from("job_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("job_id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (type === "provider") {
    const { error } = await supabaseAdmin
      .from("provider_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("provider_id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ error: "type must be 'job' or 'provider'" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
