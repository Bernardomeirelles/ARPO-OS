"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, DollarSign, ReceiptText, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { KpiCardData } from "@/types/crm";

const iconMap = {
  Target,
  DollarSign,
  TrendingUp,
  BadgeCheck,
  ReceiptText
};

export function KpiCard({ card, loading = false }: { card: KpiCardData; loading?: boolean }) {
  const Icon = iconMap[card.icon as keyof typeof iconMap] ?? Target;

  if (loading) {
    return <Skeleton className="h-40 rounded-2xl" />;
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <Card className="group relative overflow-hidden border-slate-200/80 bg-white/80 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950/75">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-primary dark:bg-slate-900">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{card.value}</div>
          </div>
          <div className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", card.change.startsWith("+") ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300")}>
            <ArrowUpRight className="h-3.5 w-3.5" />
            {card.change}
          </div>
        </div>
        <div className="relative mt-4 flex items-end gap-1">
          {card.trend.map((point, index) => (
            <div key={`${card.title}-${index}`} className="flex-1 rounded-t-md bg-gradient-to-t from-primary/20 to-accent/70" style={{ height: `${Math.max(point, 12)}px` }} />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
