import { supabase } from "./supabase";
import type { Job } from "./jobs";
import type { ProviderProfile } from "./providers";

export async function getJobFavoriteStatus(jobId: string): Promise<{
  isFavorited: boolean;
  count: number;
}> {
  const [countResult, authResult] = await Promise.all([
    supabase
      .from("job_favorite_counts")
      .select("count")
      .eq("job_id", jobId)
      .maybeSingle(),
    supabase.auth.getSession(),
  ]);

  const count = (countResult.data as { count: number } | null)?.count ?? 0;
  const userId = authResult.data.session?.user?.id ?? null;

  if (!userId) return { isFavorited: false, count };

  const { data: favData } = await supabase
    .from("job_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();

  return { isFavorited: !!favData, count };
}

export async function getProviderFavoriteStatus(providerId: string): Promise<{
  isFavorited: boolean;
  count: number;
}> {
  const [countResult, authResult] = await Promise.all([
    supabase
      .from("provider_favorite_counts")
      .select("count")
      .eq("provider_id", providerId)
      .maybeSingle(),
    supabase.auth.getSession(),
  ]);

  const count = (countResult.data as { count: number } | null)?.count ?? 0;
  const userId = authResult.data.session?.user?.id ?? null;

  if (!userId) return { isFavorited: false, count };

  const { data: favData } = await supabase
    .from("provider_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("provider_id", providerId)
    .maybeSingle();

  return { isFavorited: !!favData, count };
}

export async function toggleJobFavorite(jobId: string): Promise<{ isFavorited: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return { isFavorited: false };

  const { data: existing } = await supabase
    .from("job_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();

  let isFavorited: boolean;
  if (existing) {
    const { error } = await supabase.from("job_favorites").delete().eq("id", existing.id);
    if (error) throw new Error(error.message);
    isFavorited = false;
  } else {
    const { error } = await supabase.from("job_favorites").insert({ user_id: userId, job_id: jobId });
    if (error) throw new Error(error.message);
    isFavorited = true;
  }

  if (session?.access_token) {
    fetch("/api/log-activity", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: isFavorited ? "favorite.job.added" : "favorite.job.removed",
        event_category: "favorite",
        target_type: "job",
        target_id: jobId,
        description: isFavorited ? "Job added to favorites" : "Job removed from favorites",
      }),
    }).catch(() => {});
  }

  return { isFavorited };
}

export async function toggleProviderFavorite(providerId: string): Promise<{ isFavorited: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("provider_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("provider_id", providerId)
    .maybeSingle();

  let isFavorited: boolean;
  if (existing) {
    const { error } = await supabase.from("provider_favorites").delete().eq("id", existing.id);
    if (error) throw new Error(error.message);
    isFavorited = false;
  } else {
    const { error } = await supabase.from("provider_favorites").insert({ user_id: user.id, provider_id: providerId });
    if (error) throw new Error(error.message);
    isFavorited = true;
  }

  // Need the session token for the log endpoint
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    fetch("/api/log-activity", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: isFavorited ? "favorite.provider.added" : "favorite.provider.removed",
        event_category: "favorite",
        target_type: "provider",
        target_id: providerId,
        description: isFavorited ? "Provider added to favorites" : "Provider removed from favorites",
      }),
    }).catch(() => {});
  }

  return { isFavorited };
}

export async function getFavoritedJobs(): Promise<Job[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return [];

  const { data } = await supabase
    .from("job_favorites")
    .select(`
      jobs (
        id, client_id, title, category, description, city,
        budget, timeframe, scheduled_date, photo_urls, status,
        created_at, updated_at,
        profiles (full_name, avatar_url)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) return [];
  return data
    .map((f) => (f as unknown as { jobs: Job }).jobs)
    .filter(Boolean);
}

export async function getFavoritedProviders(): Promise<ProviderProfile[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return [];

  const { data } = await supabase
    .from("provider_favorites")
    .select(`
      provider_profiles (
        user_id, headline, main_category, skills, hourly_rate, fixed_price_from,
        service_radius_km, home_city, years_experience, response_time,
        portfolio_urls, bio, is_active, is_verified, average_rating,
        review_count, jobs_completed, created_at, updated_at,
        profiles (full_name, avatar_url, city, phone)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) return [];
  return data
    .map((f) => (f as unknown as { provider_profiles: ProviderProfile }).provider_profiles)
    .filter((p): p is ProviderProfile => !!p && p.is_active);
}
