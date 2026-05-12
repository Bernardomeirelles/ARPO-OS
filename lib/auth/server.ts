import { redirect } from "next/navigation";
import type { Role, UserProfile } from "@/types/crm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthContext = {
  userId: string;
  profile: UserProfile;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, organization_id, name, email, role, avatar_url, created_at")
    .eq("id", user.id)
    .single<UserProfile>();

  if (!profile) {
    return null;
  }

  return { userId: user.id, profile };
}

export async function requireAuthContext(options?: { allowedRoles?: Role[]; nextPath?: string }): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context) {
    const next = options?.nextPath ?? "/";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (options?.allowedRoles && !options.allowedRoles.includes(context.profile.role)) {
    redirect("/");
  }

  return context;
}
