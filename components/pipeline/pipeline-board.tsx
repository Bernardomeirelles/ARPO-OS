"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
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

  function SortableLead({ lead }: { lead: Lead }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id });

    const style = {
      transform: transform ? `translate3d(${transform.x ?? 0}px, ${transform.y ?? 0}px, 0)` : undefined,
      transition
    } as any;

    const owner = users.find((user) => user.id === lead.owner_id);

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60">
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
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const leadId = String(event.active.id);
    const overId = String(event.over?.id ?? "");

    if (!overId) return;

    // If overId is a lead id, use its stage; otherwise treat overId as a stage name
    const overLead = board.find((l) => l.id === overId);
    const targetStage = overLead ? overLead.pipeline_stage : overId;

    setBoard((current) => current.map((lead) => (lead.id === leadId ? { ...lead, pipeline_stage: targetStage } : lead)));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {grouped.map((column) => (
          <div key={column.id} id={column.name} className="w-80 flex-shrink-0">
            <Card className="min-h-[70vh] bg-white/80 dark:bg-slate-950/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">{column.name}</CardTitle>
                  <Badge>{column.leads.length}</Badge>
                </div>
                <p className="text-xs text-slate-500">R$ {column.leads.reduce((total, lead) => total + lead.value, 0).toLocaleString("pt-BR")}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <SortableContext items={column.leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
                  {column.leads.map((lead) => (
                    <SortableLead key={lead.id} lead={lead} />
                  ))}
                </SortableContext>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
