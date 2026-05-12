"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Download, Filter, Search } from "lucide-react";
import type { Activity, FileItem, Lead, TaskItem } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { exportToCsv, exportToPdf, exportToXlsx } from "@/services/export";
import { LeadDetailModal } from "@/components/leads/lead-detail-modal";

type LeadsTableProps = {
  leads: Lead[];
  activities: Activity[];
  tasks: TaskItem[];
  files: FileItem[];
};

const pageSize = 8;

export function LeadsTable({ leads, activities, tasks, files }: LeadsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Lead["status"] | "all">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const search = query.toLowerCase();
    return leads
      .filter((lead) => (status === "all" ? true : lead.status === status))
      .filter((lead) => `${lead.name} ${lead.company} ${lead.email} ${lead.source}`.toLowerCase().includes(search))
      .sort((a, b) => (sortAsc ? a.value - b.value : b.value - a.value));
  }, [leads, query, sortAsc, status]);

  const currentPageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const toggleSelected = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const bulkRows = leads.filter((lead) => selected.includes(lead.id)).map((lead) => ({
    nome: lead.name,
    empresa: lead.company,
    email: lead.email,
    valor: lead.value,
    status: lead.status
  }));

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Leads</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToCsv("leads", bulkRows.length > 0 ? bulkRows : filtered.map((lead) => ({ nome: lead.name, empresa: lead.company, email: lead.email, valor: lead.value, status: lead.status })))}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToXlsx("leads", bulkRows.length > 0 ? bulkRows : filtered.map((lead) => ({ nome: lead.name, empresa: lead.company, email: lead.email, valor: lead.value, status: lead.status })))}>
              <Download className="h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToPdf("Leads ARPO", bulkRows.length > 0 ? bulkRows : filtered.map((lead) => ({ nome: lead.name, empresa: lead.company, email: lead.email, valor: lead.value, status: lead.status })))}>
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Buscar leads, empresas ou origem..." value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          </div>
          <Button variant="outline" size="default" onClick={() => setStatus(status === "all" ? "novo" : status === "novo" ? "contato" : status === "contato" ? "qualificacao" : status === "qualificacao" ? "proposta" : status === "proposta" ? "negociacao" : status === "negociacao" ? "fechado" : "all") }>
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
          <Button variant="outline" size="default" onClick={() => setSortAsc((value) => !value)}>
            <ChevronDown className="h-4 w-4" /> {sortAsc ? "Menor valor" : "Maior valor"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "novo", "contato", "qualificacao", "proposta", "negociacao", "fechado", "perdido"] as const).map((item) => (
            <button key={item} onClick={() => { setStatus(item); setPage(1); }} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${status === item ? "bg-primary text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"}`}>
              {item}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" aria-label="Selecionar todos" checked={selected.length === currentPageRows.length && currentPageRows.length > 0} onChange={(event) => setSelected(event.target.checked ? currentPageRows.map((lead) => lead.id) : [])} /></th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {currentPageRows.map((lead) => (
                <tr key={lead.id} className="cursor-pointer border-t border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/70" onClick={() => setActiveLead(lead)}>
                  <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}><input type="checkbox" aria-label={`Selecionar ${lead.name}`} checked={selected.includes(lead.id)} onChange={() => toggleSelected(lead.id)} /></td>
                  <td className="px-4 py-4 font-medium">{lead.name}</td>
                  <td className="px-4 py-4 text-slate-500">{lead.company}</td>
                  <td className="px-4 py-4"><Badge>{lead.source}</Badge></td>
                  <td className="px-4 py-4"><Badge className="capitalize">{lead.status}</Badge></td>
                  <td className="px-4 py-4">R$ {lead.value.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <p>{filtered.length} leads encontrados</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Anterior</Button>
            <span>Página {page} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>Próxima</Button>
          </div>
        </div>
      </CardContent>

      {activeLead ? <LeadDetailModal lead={activeLead} activities={activities.filter((activity) => activity.lead_id === activeLead.id)} tasks={tasks.filter((task) => task.lead_id === activeLead.id)} files={files.filter((file) => file.entity_id === activeLead.id)} onClose={() => setActiveLead(null)} /> : null}
    </Card>
  );
}
