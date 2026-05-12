"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthShell({ title, subtitle, footerHref, footerLabel, children }: { title: string; subtitle: string; footerHref: string; footerLabel: string; children: React.ReactNode }) {
  return (
    <Card className="w-full max-w-md border-slate-200 bg-white/90 shadow-soft dark:border-slate-800 dark:bg-slate-950/80">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <p className="text-center text-sm text-slate-500">
          <Link href={footerHref} className="font-medium text-primary hover:underline">{footerLabel}</Link>
        </p>
      </CardContent>
    </Card>
  );
}
