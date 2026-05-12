import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Client, Deal, Lead, TaskItem } from "@/types/crm";

type ClientsViewProps = {
  clients: Client[];
  leads: Lead[];
  deals: Deal[];
  tasks: TaskItem[];
};

export function ClientsView({ clients, leads, deals, tasks }: ClientsViewProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {clients.map((client) => {
            const lead = leads.find((item) => item.id === client.lead_id);
            return (
              <div key={client.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950 dark:text-white">{client.name}</p>
                    <p className="text-sm text-slate-500">{client.company}</p>
                  </div>
                  <Badge>{lead?.status ?? "cliente"}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Deals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deals.map((deal) => (
              <div key={deal.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="font-medium">R$ {deal.value.toLocaleString("pt-BR")}</p>
                <p className="text-sm text-slate-500 capitalize">{deal.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-slate-500 capitalize">{task.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
