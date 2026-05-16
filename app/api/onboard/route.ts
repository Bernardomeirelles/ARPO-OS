import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated using their session
    const userClient = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { name, orgName, avatarUrl } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 422 });
    }

    // Use service role to bypass RLS for the initial org + profile creation
    const admin = createServiceClient();

    // Check if profile already exists
    const { data: existing } = await admin
      .from("user_profiles")
      .select("id, organization_id")
      .eq("id", user.id)
      .maybeSingle();

    let orgId = existing?.organization_id ?? null;

    if (!orgId) {
      const { data: org, error: orgError } = await admin
        .from("organizations")
        .insert({ name: orgName?.trim() || `${user.email} org` })
        .select("id")
        .single();
      if (orgError) throw orgError;
      orgId = org.id;
    }

    const { error: profileError } = await admin
      .from("user_profiles")
      .upsert({
        id: user.id,
        organization_id: orgId,
        name: name.trim(),
        email: user.email!,
        avatar_url: avatarUrl ?? null,
      });
    if (profileError) throw profileError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 });
  }
}
