import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Activity, Client, Deal, FileItem, KpiCardData, Lead, NotificationItem, PipelineStage, TaskItem, UserProfile } from "@/types/crm";

type CrmSnapshot = {
  users: UserProfile[];
  leads: Lead[];
  activities: Activity[];
  tasks: TaskItem[];
  clients: Client[];
  deals: Deal[];
  stages: PipelineStage[];
  notifications: NotificationItem[];
  files: FileItem[];
  dashboard: {
    kpis: KpiCardData[];
    revenueData: Array<{ month: string; receita: number }>;
    sourceData: Array<{ name: string; value: number }>;
    funnelData: Array<{ name: string; value: number }>;
    performanceData: Array<{ name: string; value: number }>;
  };
};

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function monthLabel(dateValue: string): string {
  return new Date(dateValue).toLocaleString("pt-BR", { month: "short" });
}

function buildDashboard(leads: Lead[], deals: Deal[]): CrmSnapshot["dashboard"] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const activeLeads = leads.filter((lead) => lead.status !== "fechado" && lead.status !== "perdido").length;
  const closedLeads = leads.filter((lead) => lead.status === "fechado").length;
  const conversion = leads.length > 0 ? (closedLeads / leads.length) * 100 : 0;
  const monthRevenue = deals
    .filter((deal) => {
      if (!deal.closed_at) {
        return false;
      }
      const closedDate = new Date(deal.closed_at);
      return closedDate.getMonth() === currentMonth && closedDate.getFullYear() === currentYear;
    })
    .reduce((sum, deal) => sum + toNumber(deal.value), 0);

  const wonDeals = deals.filter((deal) => deal.status === "won");
  const avgTicket = wonDeals.length > 0 ? wonDeals.reduce((sum, deal) => sum + toNumber(deal.value), 0) / wonDeals.length : 0;

  const sourcesMap = new Map<string, number>();
  leads.forEach((lead) => {
    sourcesMap.set(lead.source, (sourcesMap.get(lead.source) ?? 0) + 1);
  });

  const funnelByStage = ["Novo", "Contato", "Qualificação", "Proposta", "Negociação", "Fechado"];
  const funnelData = funnelByStage.map((stage) => ({
    name: stage,
    value: leads.filter((lead) => lead.pipeline_stage === stage).length
  }));

  const performanceMap = new Map<string, number>();
  leads.forEach((lead) => {
    performanceMap.set(lead.owner_id, (performanceMap.get(lead.owner_id) ?? 0) + 1);
  });

  const revenueByMonth = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(currentYear, currentMonth - (5 - index), 1);
    return { month: date.toLocaleString("pt-BR", { month: "short" }), receita: 0 };
  });

  deals.forEach((deal) => {
    if (!deal.closed_at || deal.status !== "won") {
      return;
    }
    const label = monthLabel(deal.closed_at);
    const row = revenueByMonth.find((item) => item.month === label);
    if (row) {
      row.receita += Math.round(toNumber(deal.value) / 1000);
    }
  });

  const kpis: KpiCardData[] = [
    { title: "Leads ativos", value: String(activeLeads), change: "+0%", trend: [20, 22, 24, 26, 28, 30], icon: "Target" },
    { title: "Receita do mês", value: `R$ ${Math.round(monthRevenue).toLocaleString("pt-BR")}`, change: "+0%", trend: [120, 140, 160, 180, 210, 240], icon: "DollarSign" },
    { title: "Conversão", value: `${conversion.toFixed(1)}%`, change: "+0 p.p.", trend: [10, 12, 13, 15, 16, 18], icon: "TrendingUp" },
    { title: "Vendas fechadas", value: String(wonDeals.length), change: "+0%", trend: [8, 11, 14, 18, 22, 24], icon: "BadgeCheck" },
    { title: "Ticket médio", value: `R$ ${Math.round(avgTicket).toLocaleString("pt-BR")}`, change: "+0%", trend: [8, 10, 12, 12, 13, 14], icon: "ReceiptText" }
  ];

  return {
    kpis,
    revenueData: revenueByMonth,
    sourceData: Array.from(sourcesMap.entries()).map(([name, value]) => ({ name, value })),
    funnelData,
    performanceData: Array.from(performanceMap.entries()).map(([name, value]) => ({ name, value }))
  };
}

function emptyDashboard(): CrmSnapshot["dashboard"] {
  return {
    kpis: [
      { title: "Leads ativos", value: "0", change: "0%", trend: [0, 0, 0, 0, 0, 0], icon: "Target" },
      { title: "Receita do mês", value: "R$ 0", change: "0%", trend: [0, 0, 0, 0, 0, 0], icon: "DollarSign" },
      { title: "Conversão", value: "0.0%", change: "0 p.p.", trend: [0, 0, 0, 0, 0, 0], icon: "TrendingUp" },
      { title: "Vendas fechadas", value: "0", change: "0%", trend: [0, 0, 0, 0, 0, 0], icon: "BadgeCheck" },
      { title: "Ticket médio", value: "R$ 0", change: "0%", trend: [0, 0, 0, 0, 0, 0], icon: "ReceiptText" }
    ],
    revenueData: [],
    sourceData: [],
    funnelData: [],
    performanceData: []
  };
}

function emptySnapshot(): CrmSnapshot {
  return {
    users: [],
    leads: [],
    activities: [],
    tasks: [],
    clients: [],
    deals: [],
    stages: [],
    notifications: [],
    files: [],
    dashboard: emptyDashboard()
  };
}

export async function getCrmSnapshot(organizationId?: string): Promise<CrmSnapshot> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !organizationId) {
    return emptySnapshot();
  }

  const supabase = await createSupabaseServerClient();

  const [
    usersResult,
    leadsResult,
    activitiesResult,
    tasksResult,
    clientsResult,
    dealsResult,
    stagesResult,
    notificationsResult,
    filesResult
  ] = await Promise.all([
    supabase.from("user_profiles").select("id, organization_id, name, email, role, avatar_url, created_at").eq("organization_id", organizationId),
    supabase.from("leads").select("id, organization_id, name, company, email, phone, position, source, status, pipeline_stage, owner_id, tags, notes, value, created_at, updated_at").eq("organization_id", organizationId),
    supabase.from("activities").select("id, organization_id, lead_id, type, description, user_id, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(20),
    supabase.from("tasks").select("id, organization_id, title, description, due_date, priority, status, assigned_to, lead_id, created_at").eq("organization_id", organizationId).order("due_date", { ascending: true }),
    supabase.from("clients").select("id, organization_id, lead_id, name, company, contact_info, created_at").eq("organization_id", organizationId),
    supabase.from("deals").select("id, organization_id, client_id, value, status, closed_at").eq("organization_id", organizationId),
    supabase.from("pipeline_stages").select("id, organization_id, name, order, color").eq("organization_id", organizationId).order("order", { ascending: true }),
    supabase.from("notifications").select("id, user_id, type, content, read, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(20),
    supabase.from("files").select("id, organization_id, entity_type, entity_id, url, name, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false })
  ]);

  if (
    usersResult.error ||
    leadsResult.error ||
    activitiesResult.error ||
    tasksResult.error ||
    clientsResult.error ||
    dealsResult.error ||
    stagesResult.error ||
    notificationsResult.error ||
    filesResult.error
  ) {
    return emptySnapshot();
  }

  const users = (usersResult.data ?? []) as UserProfile[];
  const leads = ((leadsResult.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    organization_id: String(row.organization_id),
    name: String(row.name),
    company: String(row.company),
    email: String(row.email),
    phone: String(row.phone),
    position: String(row.position),
    source: String(row.source) as Lead["source"],
    status: String(row.status) as Lead["status"],
    pipeline_stage: String(row.pipeline_stage),
    owner_id: String(row.owner_id ?? ""),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    notes: String(row.notes ?? ""),
    value: toNumber(row.value),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  }));

  const activities = (activitiesResult.data ?? []) as Activity[];
  const tasks = ((tasksResult.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    organization_id: String(row.organization_id),
    title: String(row.title),
    description: String(row.description ?? ""),
    due_date: String(row.due_date),
    priority: String(row.priority) as TaskItem["priority"],
    status: String(row.status) as TaskItem["status"],
    assigned_to: String(row.assigned_to),
    lead_id: row.lead_id ? String(row.lead_id) : null,
    created_at: String(row.created_at)
  }));
  const clients = (clientsResult.data ?? []) as Client[];
  const deals = ((dealsResult.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    organization_id: String(row.organization_id),
    client_id: String(row.client_id),
    value: toNumber(row.value),
    status: String(row.status),
    closed_at: row.closed_at ? String(row.closed_at) : null
  }));
  const stages = ((stagesResult.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    organization_id: String(row.organization_id),
    name: String(row.name),
    order: toNumber(row.order),
    color: String(row.color)
  }));
  const notifications = (notificationsResult.data ?? []) as NotificationItem[];
  const files = (filesResult.data ?? []) as FileItem[];

  return {
    users,
    leads,
    activities,
    tasks,
    clients,
    deals,
    stages,
    notifications,
    files,
    dashboard: buildDashboard(leads, deals)
  };
}

export function getFallbackCurrentUser(): UserProfile {
  throw new Error("Fallback user is disabled. Authenticate against Supabase instead.");
}
