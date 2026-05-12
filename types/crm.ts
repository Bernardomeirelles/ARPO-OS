export type Role = "admin" | "gestor" | "comercial";

export type LeadStatus = "novo" | "contato" | "qualificacao" | "proposta" | "negociacao" | "fechado" | "perdido";

export type LeadSource = "Indicação" | "Inbound" | "Outbound" | "Evento" | "LinkedIn" | "Site";

export type ActivityType = "call" | "email" | "meeting" | "note" | "task";

export interface Organization {
  id: string;
  name: string;
  plan: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  organization_id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  position: string;
  source: LeadSource;
  status: LeadStatus;
  pipeline_stage: string;
  owner_id: string;
  tags: string[];
  notes: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  organization_id: string;
  lead_id: string | null;
  name: string;
  company: string;
  contact_info: Record<string, string>;
  created_at: string;
}

export interface Deal {
  id: string;
  organization_id: string;
  client_id: string;
  value: number;
  status: string;
  closed_at: string | null;
}

export interface Activity {
  id: string;
  organization_id: string;
  lead_id: string;
  type: ActivityType;
  description: string;
  user_id: string;
  created_at: string;
}

export interface TaskItem {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "doing" | "done";
  assigned_to: string;
  lead_id: string | null;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  organization_id: string;
  name: string;
  order: number;
  color: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface FileItem {
  id: string;
  organization_id: string;
  entity_type: string;
  entity_id: string;
  url: string;
  name: string;
  created_at: string;
}

export interface KpiCardData {
  title: string;
  value: string;
  change: string;
  trend: number[];
  icon: string;
}
