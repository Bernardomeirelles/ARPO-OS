import type { LucideIcon } from "lucide-react";
import { BarChart3, BriefcaseBusiness, CalendarDays, CheckSquare2, KanbanSquare, LayoutDashboard, Settings2, Target, Users } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare2 },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings2 }
];

export const workspaceItems: NavItem[] = [{ href: "/pipeline", label: "Operação comercial", icon: BriefcaseBusiness }];
