import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AccountForm } from "@/components/settings/account-form";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "Minha Conta — ARPO CRM"
};

export default async function MinhaContaPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("user_profiles")
      .select("id, organization_id, name, email, role, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-8 py-4">
        <section className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Conta</p>
          <h1 className="text-3xl font-semibold tracking-tight">Minha conta</h1>
          <p className="text-sm text-slate-500">Gerencie seu perfil, organização e preferências.</p>
        </section>
        <AccountForm
          userId={user?.id ?? ""}
          initialEmail={user?.email ?? ""}
          initialName={profile?.name ?? user?.user_metadata?.name ?? ""}
          initialRole={profile?.role ?? "comercial"}
          initialAvatarUrl={profile?.avatar_url ?? null}
          hasProfile={!!profile}
        />
      </div>
    </AppShell>
  );
}
