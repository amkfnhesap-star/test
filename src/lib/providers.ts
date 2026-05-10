import { supabase } from "./supabase";

export interface ProviderProfile {
  user_id: string;
  headline: string;
  main_category: string;
  skills: string[];
  hourly_rate: number | null;
  fixed_price_from: number | null;
  service_radius_km: number;
  home_city: string;
  years_experience: number | null;
  response_time: string | null;
  portfolio_urls: string[];
  bio: string;
  is_active: boolean;
  is_verified: boolean;
  average_rating: number;
  review_count: number;
  jobs_completed: number;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
    phone: string | null;
  } | null;
}

export type ProviderProfileInput = {
  headline: string;
  main_category: string;
  skills: string[];
  hourly_rate: number | null;
  fixed_price_from: number | null;
  service_radius_km: number;
  home_city: string;
  years_experience: number | null;
  response_time: string | null;
  portfolio_urls: string[];
  bio: string;
};

export async function getProviderProfile(userId: string): Promise<{
  profile: ProviderProfile | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("provider_profiles")
    .select("*, profiles(full_name, avatar_url, city, phone)")
    .eq("user_id", userId)
    .single();

  if (error) return { profile: null, error: error.message };
  return { profile: data as unknown as ProviderProfile, error: null };
}

export async function getMyProviderProfile(): Promise<{
  profile: ProviderProfile | null;
  error: string | null;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profile: null, error: "Not authenticated" };
  return getProviderProfile(user.id);
}

export async function createProviderProfile(
  input: ProviderProfileInput
): Promise<{ error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("provider_profiles")
    .insert({ ...input, user_id: user.id });

  if (error) return { error: error.message };

  // Elevate role to provider
  await supabase.from("profiles").update({ role: "provider" }).eq("id", user.id);
  return { error: null };
}

export async function updateProviderProfile(
  input: Partial<ProviderProfileInput & { is_active: boolean }>
): Promise<{ error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("provider_profiles")
    .update(input)
    .eq("user_id", user.id);

  return { error: error?.message ?? null };
}

export async function getProviders({
  category,
  city,
  sort = "rating",
  page = 0,
  pageSize = 12,
}: {
  category?: string;
  city?: string;
  sort?: "rating" | "newest" | "alphabetical";
  page?: number;
  pageSize?: number;
} = {}): Promise<{
  providers: ProviderProfile[];
  hasMore: boolean;
  error: string | null;
}> {
  let query = supabase
    .from("provider_profiles")
    .select("*, profiles(full_name, avatar_url, city, phone)", { count: "exact" })
    .eq("is_active", true)
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (category) query = query.eq("main_category", category);
  if (city) query = query.ilike("home_city", `%${city}%`);

  if (sort === "rating") {
    query = query.order("average_rating", { ascending: false });
  } else if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    // alphabetical — sorted client-side after join resolves full_name
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) {
    return { providers: [], hasMore: false, error: error.message };
  }

  let providers = (data as unknown as ProviderProfile[]) ?? [];

  if (sort === "alphabetical") {
    providers = [...providers].sort((a, b) =>
      (a.profiles?.full_name ?? "").localeCompare(b.profiles?.full_name ?? "")
    );
  }

  const hasMore = count !== null ? (page + 1) * pageSize < count : false;
  return { providers, hasMore, error: null };
}

export async function uploadPortfolioPhoto(
  file: File,
  index: number
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${Date.now()}_${index}.${ext}`;

  const { error } = await supabase.storage
    .from("portfolio-photos")
    .upload(path, file, { upsert: true });

  if (error) return null;

  const { data } = supabase.storage.from("portfolio-photos").getPublicUrl(path);
  return data.publicUrl;
}
