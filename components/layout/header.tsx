"use client";

import { Bell, Menu, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Abrir navegação">
          <Menu className="h-4 w-4" />
        </Button>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex md:min-w-[320px] dark:border-slate-800 dark:bg-slate-900/70">
          <Search className="h-4 w-4 text-slate-400" />
          <Input className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0" placeholder="Buscar leads, clientes, tarefas..." />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </Button>
          <ThemeToggle />
          <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex">
            <Avatar>
              <AvatarFallback className="bg-primary text-white">MV</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-950 dark:text-white">Marcos Vieira</p>
              <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
