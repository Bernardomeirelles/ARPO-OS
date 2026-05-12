"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/constants/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full flex-col gap-6 border-r border-slate-200 bg-white/85 px-4 py-5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80", className)}>
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-white shadow-glow">A</div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-950 dark:text-white">ARPO CRM</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Premium Sales OS</p>
        </div>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1">
        {navigationItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "bg-primary text-white shadow-glow" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {active ? <motion.span layoutId="sidebar-active" className="absolute inset-0 -z-10 rounded-xl bg-primary" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <Badge className="mb-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Realtime ativo</Badge>
        <p className="text-sm font-medium text-slate-950 dark:text-white">Pipeline sincronizado em tempo real com Supabase.</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Feed, notificações e tarefas com optimistic updates.</p>
      </div>
    </aside>
  );
}
