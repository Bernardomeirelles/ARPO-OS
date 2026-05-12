# ARPO CRM

ARPO CRM is a premium, multi-tenant SaaS CRM scaffold built with Next.js 15, TypeScript, TailwindCSS, Supabase, and a modern dashboard-first UX.

## Stack

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- shadcn-inspired UI primitives
- Supabase Auth, Postgres, Storage, Realtime
- react-hook-form + zod
- Recharts
- dnd-kit
- Framer Motion
- jsPDF + SheetJS

## Project Structure

- `app` - routes, layouts, loading states, and auth pages
- `components` - dashboard, CRM modules, layout, and UI primitives
- `hooks` - realtime helpers
- `lib` - utilities and Supabase clients
- `services` - export helpers
- `types` - shared CRM types
- `constants` - navigation and mock data
- `supabase` - SQL schema and seed scripts

## Setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local` and fill the Supabase values.
3. Run the SQL in `supabase/schema.sql` in Supabase.
4. Run `supabase/seed.sql` to populate the database.
5. Start the app with `npm run dev`.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Included Screens

- Dashboard with KPI cards, charts, and realtime activity feed
- Leads table with search, filters, bulk selection, and exports
- Pipeline kanban with drag-and-drop structure
- Customers, tasks, reports, and settings pages
- Authentication pages for login, signup, and password reset

## Production Checklist

1. Configure environment variables in Vercel and local `.env.local`.
2. Run `supabase/schema.sql` in your Supabase project SQL editor.
3. Create at least one user in Supabase Auth (recommended: admin, gestor, comercial).
4. Run `supabase/seed.sql`.
5. Confirm RLS is enabled and policies are active on all tables.
6. Deploy with `npm run build` and `vercel --prod`.

## Authentication and Roles

- Auth forms are wired to Supabase Auth (login, sign-up, password recovery).
- Middleware validates authenticated sessions on protected routes.
- Role-based route restrictions are active for sensitive pages:
	- `/configuracoes`: admin
	- `/relatorios`: admin, gestor

## Data Layer

- Pages fetch organization-scoped data from Supabase on the server.
- Safe fallback data is used only when Supabase environment variables are missing.
- Multi-tenant isolation depends on `organization_id` + RLS policies in `supabase/schema.sql`.
