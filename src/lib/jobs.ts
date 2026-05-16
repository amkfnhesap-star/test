import { supabase } from "./supabase";

export type JobTimeframe = "asap" | "specific_date" | "flexible";
export type JobStatus = "open" | "awarded" | "pending_completion" | "completed" | "cancelled";

export interface Job {
  id: string;
  client_id: string;
  title: string;
  category: string;
  description: string;
  city: string;
  budget: number | null;
  timeframe: JobTimeframe;
  scheduled_date: string | null;
  photo_urls: string[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string; avatar_url: string | null } | null;
  awarded_provider_id?: string | null;
  awarded_at?: string | null;
  awarded_provider_profile?: { id: string; full_name: string } | null;
}

export interface CreateJobInput {
  title: string;
  category: string;
  description: string;
  city: string;
  budget: number | null;
  timeframe: JobTimeframe;
  scheduled_date: string | null;
  photo_urls: string[];
}

export async function createJob(
  input: CreateJobInput
): Promise<{ job: Job | null; error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { job: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("jobs")
    .insert({ ...input, client_id: user.id, status: "open" })
    .select()
    .single();

  if (error) return { job: null, error: error.message };
  return { job: data as Job, error: null };
}

export async function uploadJobPhoto(
  jobId: string,
  file: File,
  index: number
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${jobId}/${index}.${ext}`;

  const { error } = await supabase.storage
    .from("job-photos")
    .upload(path, file, { upsert: true });

  if (error) return null;

  const { data } = supabase.storage.from("job-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function getJobs({
  category,
  city,
  page = 0,
  pageSize = 12,
}: {
  category?: string;
  city?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ jobs: Job[]; hasMore: boolean; error: string | null }> {
  let query = supabase
    .from("jobs")
    .select("*, profiles(full_name, avatar_url)", { count: "exact" })
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (category) query = query.eq("category", category);
  if (city) query = query.ilike("city", `%${city}%`);

  const { data, error, count } = await query;

  if (error) return { jobs: [], hasMore: false, error: error.message };
  const hasMore = count !== null ? (page + 1) * pageSize < count : false;
  return { jobs: (data as unknown as Job[]) ?? [], hasMore, error: null };
}

export async function getJob(
  id: string
): Promise<{ job: Job | null; error: string | null }> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, profiles(full_name, avatar_url)")
    .eq("id", id)
    .single();

  if (error) return { job: null, error: error.message };
  return { job: data as unknown as Job, error: null };
}

export async function getMyJobs(): Promise<{
  jobs: Job[];
  error: string | null;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { jobs: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getMyJobs] jobs fetch failed:", error);
    return { jobs: [], error: error.message };
  }

  const jobs = (data ?? []) as Job[];

  // Fetch awarded provider profiles separately — awarded_provider_id FK points to
  // auth.users, not profiles, so Supabase can't resolve the join automatically.
  const providerIds = [
    ...new Set(jobs.map((j) => j.awarded_provider_id).filter(Boolean)),
  ] as string[];

  if (providerIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", providerIds);

    if (profilesError) {
      console.error("[getMyJobs] profiles fetch failed:", profilesError);
    } else if (profiles) {
      const byId = new Map(profiles.map((p) => [p.id, p]));
      for (const job of jobs) {
        if (job.awarded_provider_id) {
          job.awarded_provider_profile = byId.get(job.awarded_provider_id) ?? null;
        }
      }
    }
  }

  return { jobs, error: null };
}

export async function updateJobStatus(
  id: string,
  status: JobStatus
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function deleteJob(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export interface UpdateJobInput {
  title: string;
  category: string;
  description: string;
  city: string;
  budget: number | null;
  timeframe: JobTimeframe;
  scheduled_date: string | null;
  photo_urls: string[];
}

export async function updateJob(
  id: string,
  input: UpdateJobInput
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("jobs").update(input).eq("id", id);
  return { error: error?.message ?? null };
}
