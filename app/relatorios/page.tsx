import { AppShell } from "@/components/layout/app-shell";
import { ReportsView } from "@/components/reports/reports-view";
import { getAuthContext } from "@/lib/auth/server";
import { getCrmSnapshot } from "@/services/crm-server";

export default async function RelatoriosPage() {
  const auth = await getAuthContext();
  const snapshot = await getCrmSnapshot(auth?.profile.organization_id);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Relatórios</p>
          <h1 className="text-3xl font-semibold tracking-tight">Receita, conversão, performance e exportações.</h1>
        </section>
        <ReportsView leads={snapshot.leads} deals={snapshot.deals} />
      </div>
    </AppShell>
  );
}
