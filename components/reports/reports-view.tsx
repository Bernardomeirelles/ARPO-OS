"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportToPdf, exportToXlsx } from "@/services/export";
import type { Deal, Lead } from "@/types/crm";

export function ReportsView({ leads, deals }: { leads: Lead[]; deals: Deal[] }) {
  const reportRows = leads.slice(0, 12).map((lead) => ({ nome: lead.name, empresa: lead.company, valor: lead.value, status: lead.status }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Relatórios</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToPdf("Relatorio ARPO", reportRows)}>PDF</Button>
            <Button variant="outline" size="sm" onClick={() => exportToXlsx("relatorio-arpo", reportRows)}>Excel</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportRows.map((row) => (
            <div key={`${row.nome}-${row.empresa}`} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="font-medium">{row.nome}</p>
              <p className="text-sm text-slate-500">{row.empresa} • R$ {row.valor.toLocaleString("pt-BR")}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo executivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm text-slate-500">Receita estimada</p>
            <p className="text-2xl font-semibold">R$ {deals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm text-slate-500">Conversão</p>
            <p className="text-2xl font-semibold">18,9%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm text-slate-500">Produtividade</p>
            <p className="text-2xl font-semibold">Alta</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
