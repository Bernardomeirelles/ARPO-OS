import { AppShell } from "@/components/layout/app-shell";
import { TasksView } from "@/components/tasks/tasks-view";
import { CreateTaskButton } from "@/components/tasks/create-task-button";
import { getAuthContext } from "@/lib/auth/server";
import { getCrmSnapshot } from "@/services/crm-server";

export default async function TarefasPage() {
  const auth = await getAuthContext();
  const snapshot = await getCrmSnapshot(auth?.profile.organization_id);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tarefas</p>
            <h1 className="text-3xl font-semibold tracking-tight">Lista de tarefas</h1>
          </div>
          <CreateTaskButton />
        </section>
        <TasksView tasks={snapshot.tasks} users={snapshot.users} />
      </div>
    </AppShell>
  );
}
