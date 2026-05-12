import type { Activity, Client, Deal, FileItem, KpiCardData, Lead, NotificationItem, PipelineStage, TaskItem, UserProfile } from "@/types/crm";

const organizations = ["ARPO Labs"];
const sources = ["Indicação", "Inbound", "Outbound", "Evento", "LinkedIn", "Site"] as const;
const companies = ["Nexus Energy", "Bluewave Finance", "Atlas Health", "Vector Logistics", "Prime Retail", "Nova Educação", "Orion Cloud", "Mosaic Ventures", "Pulse Marketing", "Horizon Tech"];
const people = ["Ana Martins", "Bruno Lima", "Carla Souza", "Diego Alves", "Fernanda Rocha", "Gabriel Pereira", "Helena Costa", "Igor Santos", "Juliana Ribeiro", "Kleber Moreira"];

const stageNames = ["Novo", "Contato", "Qualificação", "Proposta", "Negociação", "Fechado", "Perdido"];

export const currentOrganization = {
  id: "org_arpo",
  name: organizations[0],
  plan: "Scale",
  created_at: "2026-01-10T09:00:00.000Z"
};

export const currentUser: UserProfile = {
  id: "user_admin",
  organization_id: currentOrganization.id,
  name: "Marcos Vieira",
  email: "marcos@arpo.com",
  role: "admin",
  avatar_url: null,
  created_at: "2026-01-10T09:00:00.000Z"
};

export const users: UserProfile[] = [
  currentUser,
  { id: "user_manager", organization_id: currentOrganization.id, name: "Beatriz Lima", email: "beatriz@arpo.com", role: "gestor", avatar_url: null, created_at: "2026-01-12T09:00:00.000Z" },
  { id: "user_sales", organization_id: currentOrganization.id, name: "Rafael Campos", email: "rafael@arpo.com", role: "comercial", avatar_url: null, created_at: "2026-01-15T09:00:00.000Z" }
];

export const pipelineStages: PipelineStage[] = stageNames.map((name, index) => ({
  id: `stage_${index + 1}`,
  organization_id: currentOrganization.id,
  name,
  order: index + 1,
  color: ["#60A5FA", "#38BDF8", "#34D399", "#FBBF24", "#FB7185", "#22C55E", "#64748B"][index]
}));

export const leads: Lead[] = Array.from({ length: 30 }, (_, index) => {
  const company = companies[index % companies.length];
  const person = people[index % people.length];
  const source = sources[index % sources.length];
  const stage = pipelineStages[index % pipelineStages.length];
  const value = 12000 + index * 1800;

  return {
    id: `lead_${index + 1}`,
    organization_id: currentOrganization.id,
    name: person,
    company,
    email: `${person.toLowerCase().replace(/\s/g, ".")}@${company.toLowerCase().replace(/\s/g, "")}.com`,
    phone: `+55 11 9${String(87000000 + index).slice(1)}`,
    position: ["CEO", "Head de Vendas", "RevOps", "CMO", "Founder", "Diretor Comercial"][index % 6],
    source,
    status: index % 6 === 5 ? "fechado" : (stage.name.toLowerCase() as Lead["status"]),
    pipeline_stage: stage.name,
    owner_id: users[index % users.length].id,
    tags: ["prioritário", index % 2 === 0 ? "enterprise" : "smb", index % 3 === 0 ? "expansão" : "recorrência"],
    notes: "Interessado em acelerar o pipeline com relatórios executivos e automações.",
    value,
    created_at: new Date(2026, 3, (index % 27) + 1).toISOString(),
    updated_at: new Date(2026, 4, (index % 27) + 1).toISOString()
  };
});

export const activities: Activity[] = Array.from({ length: 12 }, (_, index) => ({
  id: `activity_${index + 1}`,
  organization_id: currentOrganization.id,
  lead_id: leads[index].id,
  type: ["call", "email", "meeting", "note", "task"][index % 5] as Activity["type"],
  description: ["Ligação de descoberta concluída.", "Email com proposta enviada.", "Reunião de qualificação agendada.", "Nota adicionada pelo gestor.", "Follow-up criado para a equipe."][index % 5],
  user_id: users[index % users.length].id,
  created_at: new Date(2026, 4, 11 - index).toISOString()
}));

export const deals: Deal[] = leads.slice(0, 14).map((lead, index) => ({
  id: `deal_${index + 1}`,
  organization_id: currentOrganization.id,
  client_id: `client_${index + 1}`,
  value: lead.value * 1.15,
  status: index % 3 === 0 ? "won" : index % 3 === 1 ? "open" : "lost",
  closed_at: index % 3 === 0 ? new Date(2026, 4, 2 + index).toISOString() : null
}));

export const tasks: TaskItem[] = Array.from({ length: 10 }, (_, index) => ({
  id: `task_${index + 1}`,
  organization_id: currentOrganization.id,
  title: ["Enviar proposta revisada", "Agendar call de follow-up", "Atualizar lead scoring", "Revisar contrato", "Preparar demo executiva"][index % 5],
  description: "Tarefa operacional vinculada ao pipeline principal.",
  due_date: new Date(2026, 4, 12 + index).toISOString(),
  priority: (["low", "medium", "high", "urgent"] as const)[index % 4],
  status: (["todo", "doing", "done"] as const)[index % 3],
  assigned_to: users[index % users.length].id,
  lead_id: leads[index].id,
  created_at: new Date(2026, 4, 1 + index).toISOString()
}));

export const clients: Client[] = leads.slice(0, 14).map((lead, index) => ({
  id: `client_${index + 1}`,
  organization_id: currentOrganization.id,
  lead_id: lead.id,
  name: lead.name,
  company: lead.company,
  contact_info: {
    email: lead.email,
    phone: lead.phone,
    position: lead.position
  },
  created_at: new Date(2026, 4, 4 + index).toISOString()
}));

export const files: FileItem[] = leads.slice(0, 8).map((lead, index) => ({
  id: `file_${index + 1}`,
  organization_id: currentOrganization.id,
  entity_type: "lead",
  entity_id: lead.id,
  url: `/files/${lead.company.toLowerCase().replace(/\s/g, "-")}.pdf`,
  name: `${lead.company}-proposta.pdf`,
  created_at: new Date(2026, 4, 6 + index).toISOString()
}));

export const notifications: NotificationItem[] = [
  {
    id: "notification_1",
    user_id: currentUser.id,
    type: "task",
    content: "Nova tarefa de follow-up atribuída para você.",
    read: false,
    created_at: new Date(2026, 4, 12, 10, 30).toISOString()
  },
  {
    id: "notification_2",
    user_id: currentUser.id,
    type: "lead",
    content: "Lead movimentado para Proposta com sucesso.",
    read: true,
    created_at: new Date(2026, 4, 11, 14, 15).toISOString()
  }
];

export const kpiCards: KpiCardData[] = [
  { title: "Leads ativos", value: "128", change: "+18,4%", trend: [22, 24, 28, 31, 35, 38], icon: "Target" },
  { title: "Receita do mês", value: "R$ 248k", change: "+12,2%", trend: [120, 140, 155, 172, 198, 248], icon: "DollarSign" },
  { title: "Conversão", value: "18,9%", change: "+2,1 p.p.", trend: [12, 13, 15, 16, 18, 19], icon: "TrendingUp" },
  { title: "Vendas fechadas", value: "34", change: "+9,8%", trend: [12, 18, 20, 24, 27, 34], icon: "BadgeCheck" },
  { title: "Ticket médio", value: "R$ 14,6k", change: "+4,6%", trend: [11, 12, 12, 13, 14, 15], icon: "ReceiptText" }
];

export const funnelData = [
  { name: "Novo", value: 128 },
  { name: "Contato", value: 104 },
  { name: "Qualificação", value: 74 },
  { name: "Proposta", value: 42 },
  { name: "Negociação", value: 19 },
  { name: "Fechado", value: 34 }
];

export const revenueData = [
  { month: "Jan", receita: 120 },
  { month: "Fev", receita: 138 },
  { month: "Mar", receita: 154 },
  { month: "Abr", receita: 191 },
  { month: "Mai", receita: 224 },
  { month: "Jun", receita: 248 }
];

export const sourceData = [
  { name: "Indicação", value: 42 },
  { name: "Inbound", value: 31 },
  { name: "Outbound", value: 26 },
  { name: "Evento", value: 19 },
  { name: "LinkedIn", value: 11 },
  { name: "Site", value: 15 }
];

export const performanceData = [
  { name: "Beatriz", value: 18 },
  { name: "Rafael", value: 14 },
  { name: "Marcos", value: 22 }
];
