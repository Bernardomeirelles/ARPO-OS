import { AppShell } from "@/components/layout/app-shell";
import { LeadsTable } from "@/components/leads/leads-table";
import { getAuthContext } from "@/lib/auth/server";
import { getCrmSnapshot } from "@/services/crm-server";

export default async function LeadsPage() {
  const auth = await getAuthContext();
  const snapshot = await getCrmSnapshot(auth?.profile.organization_id);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Leads</p>
          <h1 className="text-3xl font-semibold tracking-tight">Pipeline de aquisição com tabela, filtros e bulk actions.</h1>
        </section>
        <LeadsTable leads={snapshot.leads} activities={snapshot.activities} tasks={snapshot.tasks} files={snapshot.files} />
      </div>
    </AppShell>
  );
}
