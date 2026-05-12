import { AppShell } from "@/components/layout/app-shell";
import { Overview } from "@/components/dashboard/overview";
import { getAuthContext } from "@/lib/auth/server";
import { getCrmSnapshot } from "@/services/crm-server";

export default async function Page() {
  const auth = await getAuthContext();
  const snapshot = await getCrmSnapshot(auth?.profile.organization_id);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-glow dark:border-slate-800 md:px-8 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.45),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.4),transparent_32%)]" />
          <div className="relative max-w-3xl space-y-4">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/80">ARPO CRM • vendas, operação e previsibilidade</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Um CRM premium, rápido e pronto para escalar com a operação comercial.</h1>
            <p className="max-w-2xl text-sm text-slate-300 md:text-base">Dashboard analítico, pipeline realtime, multitarefa e estrutura multi-tenant com Supabase, preparada para produção e deploy na Vercel.</p>
          </div>
        </section>

        <Overview
          kpis={snapshot.dashboard.kpis}
          activities={snapshot.activities}
          revenueData={snapshot.dashboard.revenueData}
          sourceData={snapshot.dashboard.sourceData}
          funnelData={snapshot.dashboard.funnelData}
          performanceData={snapshot.dashboard.performanceData}
        />
      </div>
    </AppShell>
  );
}
