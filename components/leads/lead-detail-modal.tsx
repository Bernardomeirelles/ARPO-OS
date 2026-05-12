"use client";

import { X } from "lucide-react";
import type { Activity, FileItem, Lead, TaskItem } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LeadDetailModalProps = {
  lead: Lead;
  activities: Activity[];
  tasks: TaskItem[];
  files: FileItem[];
  onClose: () => void;
};

export function LeadDetailModal({ lead, activities, tasks, files, onClose }: LeadDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-auto p-0">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Detalhes do lead</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{lead.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{lead.company}</p>
          </div>
          <Button variant="outline" size="icon" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5">
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="files">Arquivos</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <section className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="p-4">
                    <p className="text-xs text-slate-500">E-mail</p>
                    <p className="mt-1 text-sm font-medium">{lead.email}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500">Telefone</p>
                    <p className="mt-1 text-sm font-medium">{lead.phone}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500">Responsável</p>
                    <p className="mt-1 text-sm font-medium">{lead.owner_id}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500">Valor</p>
                    <p className="mt-1 text-sm font-medium">R$ {lead.value.toLocaleString("pt-BR")}</p>
                  </Card>
                </div>

                <Card className="p-4">
                  <p className="text-sm font-semibold">Tags</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lead.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </Card>
              </section>

              <Card className="p-4">
                <p className="text-sm font-semibold">Resumo operacional</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{lead.notes}</p>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-2">
              {activities.map((activity) => (
                <div key={activity.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">{activity.description}</div>
              ))}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">{task.title}</div>
              ))}
            </TabsContent>

            <TabsContent value="files" className="space-y-2">
              {files.length > 0 ? files.map((file) => <div key={file.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">{file.name}</div>) : <div className="rounded-xl border border-dashed border-slate-300 p-3">Nenhum arquivo anexado.</div>}
            </TabsContent>

            <TabsContent value="notes" className="space-y-2">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">{lead.notes}</div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
