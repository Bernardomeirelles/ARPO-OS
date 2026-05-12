create extension if not exists "pgcrypto";

do $$
begin
  create type public.user_role as enum ('admin', 'gestor', 'comercial');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.lead_status as enum ('novo', 'contato', 'qualificacao', 'proposta', 'negociacao', 'fechado', 'perdido');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_status as enum ('todo', 'doing', 'done');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'Scale',
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'comercial',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  "order" integer not null,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  company text not null,
  email text not null,
  phone text not null,
  position text not null,
  source text not null,
  status public.lead_status not null default 'novo',
  pipeline_stage text not null,
  owner_id uuid references public.user_profiles(id) on delete set null,
  tags text[] not null default '{}',
  notes text not null default '',
  value numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  name text not null,
  company text not null,
  contact_info jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  value numeric(12, 2) not null,
  status text not null,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null,
  description text not null,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null default '',
  due_date timestamptz not null,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'todo',
  assigned_to uuid not null references public.user_profiles(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  type text not null,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  url text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_organization_id on public.user_profiles (organization_id);
create index if not exists idx_user_profiles_role on public.user_profiles (role);
create index if not exists idx_pipeline_stages_organization_id on public.pipeline_stages (organization_id);
create index if not exists idx_pipeline_stages_order on public.pipeline_stages (organization_id, "order");
create index if not exists idx_leads_organization_id on public.leads (organization_id);
create index if not exists idx_leads_owner_id on public.leads (owner_id);
create index if not exists idx_leads_stage on public.leads (organization_id, pipeline_stage);
create index if not exists idx_leads_status on public.leads (organization_id, status);
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_tags on public.leads using gin (tags);
create index if not exists idx_clients_organization_id on public.clients (organization_id);
create index if not exists idx_clients_lead_id on public.clients (lead_id);
create index if not exists idx_deals_organization_id on public.deals (organization_id);
create index if not exists idx_deals_client_id on public.deals (client_id);
create index if not exists idx_activities_organization_id on public.activities (organization_id);
create index if not exists idx_activities_lead_id on public.activities (lead_id);
create index if not exists idx_tasks_organization_id on public.tasks (organization_id);
create index if not exists idx_tasks_assigned_to on public.tasks (assigned_to);
create index if not exists idx_notifications_organization_id on public.notifications (organization_id);
create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_files_organization_id on public.files (organization_id);
create index if not exists idx_files_entity on public.files (entity_type, entity_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_leads_updated_at on public.leads;
create trigger trigger_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_profiles profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = target_org
  );
$$;

create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_profiles profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = target_org
      and profiles.role = 'admin'
  );
$$;

alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.files enable row level security;

drop policy if exists "org select own" on public.organizations;
create policy "org select own" on public.organizations for select using (public.is_org_member(id));

drop policy if exists "profiles select own org" on public.user_profiles;
create policy "profiles select own org" on public.user_profiles for select using (public.is_org_member(organization_id));

drop policy if exists "profiles manage admin" on public.user_profiles;
create policy "profiles manage admin" on public.user_profiles for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

drop policy if exists "stages select org" on public.pipeline_stages;
create policy "stages select org" on public.pipeline_stages for select using (public.is_org_member(organization_id));
drop policy if exists "stages manage admin" on public.pipeline_stages;
create policy "stages manage admin" on public.pipeline_stages for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

drop policy if exists "leads select org" on public.leads;
create policy "leads select org" on public.leads for select using (public.is_org_member(organization_id));
drop policy if exists "leads manage org" on public.leads;
create policy "leads manage org" on public.leads for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists "clients select org" on public.clients;
create policy "clients select org" on public.clients for select using (public.is_org_member(organization_id));
drop policy if exists "clients manage org" on public.clients;
create policy "clients manage org" on public.clients for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists "deals select org" on public.deals;
create policy "deals select org" on public.deals for select using (public.is_org_member(organization_id));
drop policy if exists "deals manage org" on public.deals;
create policy "deals manage org" on public.deals for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists "activities select org" on public.activities;
create policy "activities select org" on public.activities for select using (public.is_org_member(organization_id));
drop policy if exists "activities manage org" on public.activities;
create policy "activities manage org" on public.activities for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists "tasks select org" on public.tasks;
create policy "tasks select org" on public.tasks for select using (public.is_org_member(organization_id));
drop policy if exists "tasks manage org" on public.tasks;
create policy "tasks manage org" on public.tasks for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists "notifications select own" on public.notifications;
create policy "notifications select own" on public.notifications for select using (user_id = auth.uid() and public.is_org_member(organization_id));
drop policy if exists "notifications manage own" on public.notifications;
create policy "notifications manage own" on public.notifications for update using (user_id = auth.uid() and public.is_org_member(organization_id)) with check (user_id = auth.uid() and public.is_org_member(organization_id));

drop policy if exists "files select org" on public.files;
create policy "files select org" on public.files for select using (public.is_org_member(organization_id));
drop policy if exists "files manage org" on public.files;
create policy "files manage org" on public.files for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
