import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET() {
  try {
    const userClient = await createSupabaseServerClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: tokenRow } = await admin
      .from("google_tokens")
      .select("access_token, refresh_token, expires_at")
      .eq("user_id", user.id)
      .single();

    if (!tokenRow) {
      return NextResponse.json({ connected: false });
    }

    let accessToken = tokenRow.access_token;

    // Refresh if expired (with 60s buffer)
    if (new Date(tokenRow.expires_at) < new Date(Date.now() + 60_000)) {
      if (!tokenRow.refresh_token) {
        return NextResponse.json({ connected: false, error: "Token expirado. Reconecte o Google Calendar." });
      }
      const refreshed = await refreshAccessToken(tokenRow.refresh_token);
      if (!refreshed) {
        return NextResponse.json({ connected: false, error: "Falha ao renovar token. Reconecte o Google Calendar." });
      }
      accessToken = refreshed.access_token;
      await admin.from("google_tokens").update({
        access_token: accessToken,
        expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    }

    const now = new Date().toISOString();
    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=20&orderBy=startTime&singleEvents=true`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!calRes.ok) {
      return NextResponse.json({ connected: false, error: "Erro ao buscar eventos do Google Calendar." });
    }

    const calData = await calRes.json();
    return NextResponse.json({ connected: true, events: calData.items ?? [] });
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 });
  }
}
