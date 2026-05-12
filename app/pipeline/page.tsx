import { AppShell } from "@/components/layout/app-shell";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { getAuthContext } from "@/lib/auth/server";
import { getCrmSnapshot } from "@/services/crm-server";

export default async function PipelinePage() {
  const auth = await getAuthContext();
  const snapshot = await getCrmSnapshot(auth?.profile.organization_id);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pipeline</p>
          <h1 className="text-3xl font-semibold tracking-tight">Kanban realtime com etapas comerciais e drag-and-drop.</h1>
        </section>
        <PipelineBoard leads={snapshot.leads} stages={snapshot.stages} users={snapshot.users} />
      </div>
    </AppShell>
  );
}
