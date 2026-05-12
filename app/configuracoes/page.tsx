import { AppShell } from "@/components/layout/app-shell";
import { SettingsView } from "@/components/settings/settings-view";

export default function ConfiguracoesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Configurações</p>
          <h1 className="text-3xl font-semibold tracking-tight">Organização, integrações e estrutura de permissões.</h1>
        </section>
        <SettingsView />
      </div>
    </AppShell>
  );
}
