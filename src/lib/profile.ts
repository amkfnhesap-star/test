import { supabase } from "./supabase";

export interface NotificationPreferences {
  job_responses: boolean;
  platform_updates: boolean;
  marketing: boolean;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  city: string | null;
  phone: string | null;
  bio: string | null;
  role: string | null;
  notification_preferences: NotificationPreferences | null;
}

export async function getProfile(): Promise<{ profile: Profile | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { profile: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return { profile: null, error: error.message };
  return { profile: { ...data, email: user.email ?? null } as Profile, error: null };
}

export async function updateProfile(
  updates: Partial<Omit<Profile, "id" | "email">>
): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  return { error: error?.message ?? null };
}

export async function uploadAvatar(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (error) return null;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
