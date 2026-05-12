"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead, PipelineStage, UserProfile } from "@/types/crm";

type PipelineBoardProps = {
  leads: Lead[];
  stages: PipelineStage[];
  users: UserProfile[];
};

export function PipelineBoard({ leads, stages, users }: PipelineBoardProps) {
  const [board, setBoard] = useState(leads);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    return stages.map((stage) => ({
      ...stage,
      leads: board.filter((lead) => lead.pipeline_stage === stage.name)
    }));
  }, [board, stages]);

  const handleDragEnd = (event: DragEndEvent) => {
    const leadId = String(event.active.id);
    const targetStage = String(event.over?.id ?? "");

    if (!targetStage) {
      return;
    }

    setBoard((current) => current.map((lead) => (lead.id === leadId ? { ...lead, pipeline_stage: targetStage } : lead)));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 xl:grid-cols-7">
        {grouped.map((column) => (
          <Card key={column.id} className="min-h-[70vh] bg-white/80 dark:bg-slate-950/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">{column.name}</CardTitle>
                <Badge>{column.leads.length}</Badge>
              </div>
              <p className="text-xs text-slate-500">R$ {column.leads.reduce((total, lead) => total + lead.value, 0).toLocaleString("pt-BR")}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <SortableContext items={column.leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
                {column.leads.map((lead) => {
                  const owner = users.find((user) => user.id === lead.owner_id);

                  return (
                    <div key={lead.id} id={lead.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-950 dark:text-white">{lead.name}</p>
                          <p className="text-xs text-slate-500">{lead.company}</p>
                        </div>
                        <Badge className="text-[10px] uppercase tracking-wide">{lead.source}</Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>R$ {lead.value.toLocaleString("pt-BR")}</span>
                        <span>{owner?.name ?? "Equipe"}</span>
                      </div>
                    </div>
                  );
                })}
              </SortableContext>
            </CardContent>
          </Card>
        ))}
      </div>
    </DndContext>
  );
}
