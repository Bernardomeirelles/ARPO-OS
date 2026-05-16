import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TaskItem, UserProfile } from "@/types/crm";

const PRIORITY_STYLES: Record<TaskItem["priority"], string> = {
  low:    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  high:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  urgent: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

const PRIORITY_LABELS: Record<TaskItem["priority"], string> = {
  low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente",
};

const STATUS_LABELS: Record<TaskItem["status"], string> = {
  todo: "A fazer", doing: "Em andamento", done: "Concluída",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function TasksView({ tasks, users }: { tasks: TaskItem[]; users: UserProfile[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Lista de tarefas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nenhuma tarefa ainda. Clique em "Nova tarefa" para começar.</p>
          ) : (
            tasks.map((task) => {
              const assignee = users.find((u) => u.id === task.assigned_to);
              const overdue = task.status !== "done" && new Date(task.due_date) < new Date();
              return (
                <div key={task.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium leading-snug">{task.title}</p>
                      {task.description && (
                        <p className="mt-0.5 truncate text-sm text-slate-500">{task.description}</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>{assignee?.name ?? "Equipe"}</span>
                      <span className={overdue ? "font-medium text-rose-500" : ""}>
                        {formatDate(task.due_date)}{overdue ? " · atrasada" : ""}
                      </span>
                    </div>
                    <Badge className="capitalize text-xs">
                      {STATUS_LABELS[task.status]}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(["todo", "doing", "done"] as TaskItem["status"][]).map((s) => {
            const count = tasks.filter((t) => t.status === s).length;
            return (
              <div key={s} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">{STATUS_LABELS[s]}</span>
                <span className="text-lg font-semibold">{count}</span>
              </div>
            );
          })}
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/20">
            <span className="text-sm text-rose-600 dark:text-rose-400">Atrasadas</span>
            <span className="text-lg font-semibold text-rose-600 dark:text-rose-400">
              {tasks.filter((t) => t.status !== "done" && new Date(t.due_date) < new Date()).length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
