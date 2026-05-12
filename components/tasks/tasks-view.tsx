import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TaskItem, UserProfile } from "@/types/crm";

export function TasksView({ tasks, users }: { tasks: TaskItem[]; users: UserProfile[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Lista de tarefas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => {
            const assignee = users.find((user) => user.id === task.assigned_to);
            return (
              <div key={task.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-slate-500">{task.description}</p>
                  </div>
                  <Badge className="capitalize">{task.priority}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{assignee?.name ?? "Equipe"}</span>
                  <span className="capitalize">{task.status}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {Array.from({ length: 28 }, (_, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                {index + 1}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
