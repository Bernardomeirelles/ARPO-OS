"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock3, Mail, MessageSquareText, PhoneCall, StickyNote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/types/crm";

const iconMap = {
  call: PhoneCall,
  email: Mail,
  meeting: CalendarDays,
  note: StickyNote,
  task: MessageSquareText
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Feed realtime</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type];

          return (
            <motion.div key={activity.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-950 dark:text-white">{activity.description}</p>
                    <Badge className="shrink-0 bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                      <Clock3 className="mr-1 h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Lead {activity.lead_id}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
