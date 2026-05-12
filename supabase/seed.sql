do $$
declare
  org_id constant uuid := '11111111-1111-1111-1111-111111111111';
  admin_id uuid;
  manager_id uuid;
  sales_id uuid;
begin
  insert into public.organizations (id, name, plan, created_at)
  values (org_id, 'ARPO Labs', 'Scale', now())
  on conflict (id) do update set name = excluded.name, plan = excluded.plan;

  with auth_seed as (
    select id, email, row_number() over (order by created_at asc) as rn
    from auth.users
    limit 3
  )
  select
    max(case when rn = 1 then id end),
    max(case when rn = 2 then id end),
    max(case when rn = 3 then id end)
  into admin_id, manager_id, sales_id
  from auth_seed;

  if admin_id is null then
    raise exception 'Seed requires at least 1 auth.users record. Create users in Supabase Auth first.';
  end if;

  if manager_id is null then
    manager_id := admin_id;
  end if;

  if sales_id is null then
    sales_id := admin_id;
  end if;

  insert into public.user_profiles (id, organization_id, name, email, role, avatar_url, created_at)
  values
    (admin_id, org_id, 'Marcos Vieira', coalesce((select email from auth.users where id = admin_id), 'marcos@arpo.com'), 'admin', null, now()),
    (manager_id, org_id, 'Beatriz Lima', coalesce((select email from auth.users where id = manager_id), 'beatriz@arpo.com'), 'gestor', null, now()),
    (sales_id, org_id, 'Rafael Campos', coalesce((select email from auth.users where id = sales_id), 'rafael@arpo.com'), 'comercial', null, now())
  on conflict (id) do update
  set organization_id = excluded.organization_id,
      name = excluded.name,
      email = excluded.email,
      role = excluded.role;

  insert into public.pipeline_stages (id, organization_id, name, "order", color, created_at)
  values
    ('55555555-5555-5555-5555-555555555551', org_id, 'Novo', 1, '#60A5FA', now()),
    ('55555555-5555-5555-5555-555555555552', org_id, 'Contato', 2, '#38BDF8', now()),
    ('55555555-5555-5555-5555-555555555553', org_id, 'Qualificacao', 3, '#34D399', now()),
    ('55555555-5555-5555-5555-555555555554', org_id, 'Proposta', 4, '#FBBF24', now()),
    ('55555555-5555-5555-5555-555555555555', org_id, 'Negociacao', 5, '#FB7185', now()),
    ('55555555-5555-5555-5555-555555555556', org_id, 'Fechado', 6, '#22C55E', now()),
    ('55555555-5555-5555-5555-555555555557', org_id, 'Perdido', 7, '#64748B', now())
  on conflict (id) do update
  set name = excluded.name,
      "order" = excluded."order",
      color = excluded.color;

  insert into public.leads (id, organization_id, name, company, email, phone, position, source, status, pipeline_stage, owner_id, tags, notes, value, created_at, updated_at)
  select
    (('00000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid),
    org_id,
    (array['Ana Martins','Bruno Lima','Carla Souza','Diego Alves','Fernanda Rocha','Gabriel Pereira','Helena Costa','Igor Santos','Juliana Ribeiro','Kleber Moreira'])[((gs - 1) % 10) + 1],
    (array['Nexus Energy','Bluewave Finance','Atlas Health','Vector Logistics','Prime Retail','Nova Educacao','Orion Cloud','Mosaic Ventures','Pulse Marketing','Horizon Tech'])[((gs - 1) % 10) + 1],
    lower(replace((array['Ana Martins','Bruno Lima','Carla Souza','Diego Alves','Fernanda Rocha','Gabriel Pereira','Helena Costa','Igor Santos','Juliana Ribeiro','Kleber Moreira'])[((gs - 1) % 10) + 1], ' ', '.')) || '@example.com',
    '+55 11 9' || lpad((87000000 + gs)::text, 8, '0'),
    (array['CEO','Head de Vendas','RevOps','CMO','Founder','Diretor Comercial'])[((gs - 1) % 6) + 1],
    (array['Indicacao','Inbound','Outbound','Evento','LinkedIn','Site'])[((gs - 1) % 6) + 1],
    (array['novo','contato','qualificacao','proposta','negociacao','fechado','perdido']::public.lead_status[])[((gs - 1) % 7) + 1],
    (array['Novo','Contato','Qualificacao','Proposta','Negociacao','Fechado','Perdido'])[((gs - 1) % 7) + 1],
    (array[admin_id, manager_id, sales_id])[((gs - 1) % 3) + 1],
    array['prioritario', case when gs % 2 = 0 then 'enterprise' else 'smb' end],
    'Interessado em acelerar o pipeline com relatorios executivos e automacoes.',
    12000 + (gs * 1800),
    now() - ((30 - gs) || ' days')::interval,
    now() - ((30 - gs) || ' days')::interval
  from generate_series(1, 30) as gs
  on conflict (id) do nothing;

  insert into public.clients (id, organization_id, lead_id, name, company, contact_info, created_at)
  select
    (('10000000-0000-0000-0000-' || lpad(rn::text, 12, '0'))::uuid),
    org_id,
    id,
    name,
    company,
    jsonb_build_object('email', email, 'phone', phone, 'position', position),
    now() - ((14 - rn) || ' days')::interval
  from (
    select id, name, company, email, phone, position, row_number() over (order by created_at asc) as rn
    from public.leads
    where organization_id = org_id
    limit 14
  ) t
  on conflict (id) do nothing;

  insert into public.deals (id, organization_id, client_id, value, status, closed_at, created_at)
  select
    (('20000000-0000-0000-0000-' || lpad(rn::text, 12, '0'))::uuid),
    org_id,
    id,
    15000 + (rn * 1900),
    case when rn % 3 = 0 then 'won' when rn % 3 = 1 then 'open' else 'lost' end,
    case when rn % 3 = 0 then now() - ((10 + rn) || ' days')::interval else null end,
    now()
  from (
    select id, row_number() over (order by created_at asc) as rn
    from public.clients
    where organization_id = org_id
    limit 14
  ) c
  on conflict (id) do nothing;

  insert into public.activities (id, organization_id, lead_id, type, description, user_id, created_at)
  select
    (('30000000-0000-0000-0000-' || lpad(rn::text, 12, '0'))::uuid),
    org_id,
    id,
    (array['call','email','meeting','note','task'])[((rn - 1) % 5) + 1],
    (array['Ligacao de descoberta concluida.','Email com proposta enviada.','Reuniao de qualificacao agendada.','Nota adicionada pelo gestor.','Follow-up criado para a equipe.'])[((rn - 1) % 5) + 1],
    (array[admin_id, manager_id, sales_id])[((rn - 1) % 3) + 1],
    now() - ((12 - rn) || ' days')::interval
  from (
    select id, row_number() over (order by created_at asc) as rn
    from public.leads
    where organization_id = org_id
    limit 12
  ) l
  on conflict (id) do nothing;

  insert into public.tasks (id, organization_id, title, description, due_date, priority, status, assigned_to, lead_id, created_at)
  select
    (('40000000-0000-0000-0000-' || lpad(rn::text, 12, '0'))::uuid),
    org_id,
    (array['Enviar proposta revisada','Agendar call de follow-up','Atualizar lead scoring','Revisar contrato','Preparar demo executiva'])[((rn - 1) % 5) + 1],
    'Tarefa operacional vinculada ao pipeline principal.',
    now() + (rn || ' days')::interval,
    (array['low','medium','high','urgent']::public.task_priority[])[((rn - 1) % 4) + 1],
    (array['todo','doing','done']::public.task_status[])[((rn - 1) % 3) + 1],
    (array[admin_id, manager_id, sales_id])[((rn - 1) % 3) + 1],
    id,
    now() - ((10 - rn) || ' days')::interval
  from (
    select id, row_number() over (order by created_at asc) as rn
    from public.leads
    where organization_id = org_id
    limit 10
  ) l
  on conflict (id) do nothing;

  insert into public.files (id, organization_id, entity_type, entity_id, url, name, created_at)
  select
    (('50000000-0000-0000-0000-' || lpad(rn::text, 12, '0'))::uuid),
    org_id,
    'lead',
    id,
    '/files/' || lower(replace(company, ' ', '-')) || '.pdf',
    company || '-proposta.pdf',
    now() - ((8 - rn) || ' days')::interval
  from (
    select id, company, row_number() over (order by created_at asc) as rn
    from public.leads
    where organization_id = org_id
    limit 8
  ) l
  on conflict (id) do nothing;

  insert into public.notifications (id, organization_id, user_id, type, content, read, created_at)
  values
    ('60000000-0000-0000-0000-000000000001', org_id, admin_id, 'task', 'Nova tarefa de follow-up atribuida para voce.', false, now() - interval '2 hours'),
    ('60000000-0000-0000-0000-000000000002', org_id, admin_id, 'lead', 'Lead movimentado para Proposta com sucesso.', true, now() - interval '5 hours')
  on conflict (id) do nothing;
end $$;
