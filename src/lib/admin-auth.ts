import type { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabase-admin";

export async function verifyAdmin(
  request: NextRequest
): Promise<{ email: string } | null> {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  if (!user?.email) return null;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;

  return { email: user.email };
}
