"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const labelMap: Record<string, string> = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/pipeline": "Pipeline",
  "/clientes": "Clientes",
  "/tarefas": "Tarefas",
  "/relatorios": "Relatórios",
  "/configuracoes": "Configurações"
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/") {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Dashboard</p>;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
      <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Dashboard</Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const label = labelMap[href] ?? segment;

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? <span className="font-medium text-slate-900 dark:text-white">{label}</span> : <Link href={href} className="hover:text-slate-900 dark:hover:text-white">{label}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
