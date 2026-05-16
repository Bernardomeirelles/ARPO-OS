import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          }
        }
      }
    );

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If this was a Google OAuth login, persist the provider tokens
      const session = sessionData?.session;
      if (session?.provider_token && session.user) {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const expiresAt = new Date(Date.now() + 3600 * 1000); // Google tokens last 1h
        await admin.from("google_tokens").upsert({
          user_id: session.user.id,
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token ?? null,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
  }

  // Something went wrong — send back to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
