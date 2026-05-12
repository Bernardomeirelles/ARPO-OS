import { AppShell } from "@/components/layout/app-shell";
import { TasksView } from "@/components/tasks/tasks-view";
import { getAuthContext } from "@/lib/auth/server";
import { getCrmSnapshot } from "@/services/crm-server";

export default async function TarefasPage() {
  const auth = await getAuthContext();
  const snapshot = await getCrmSnapshot(auth?.profile.organization_id);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tarefas</p>
          <h1 className="text-3xl font-semibold tracking-tight">Lista de tarefas com status, prioridade e visão de calendário.</h1>
        </section>
        <TasksView tasks={snapshot.tasks} users={snapshot.users} />
      </div>
    </AppShell>
  );
}
