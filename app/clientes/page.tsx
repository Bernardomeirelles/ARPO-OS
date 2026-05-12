import { AppShell } from "@/components/layout/app-shell";
import { ClientsView } from "@/components/clients/clients-view";
import { getAuthContext } from "@/lib/auth/server";
import { getCrmSnapshot } from "@/services/crm-server";

export default async function ClientesPage() {
  const auth = await getAuthContext();
  const snapshot = await getCrmSnapshot(auth?.profile.organization_id);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Clientes</p>
          <h1 className="text-3xl font-semibold tracking-tight">Base de clientes com detalhes operacionais e histórico.</h1>
        </section>
        <ClientsView clients={snapshot.clients} leads={snapshot.leads} deals={snapshot.deals} tasks={snapshot.tasks} />
      </div>
    </AppShell>
  );
}
