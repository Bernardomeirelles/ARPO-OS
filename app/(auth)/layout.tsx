export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-slate-950 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.42),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.5),transparent_35%)]" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs tracking-[0.2em] text-white/70">ARPO CRM</div>
            <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-tight">Operação comercial com velocidade, clareza e sofisticação.</h1>
            <p className="mt-5 max-w-lg text-sm text-slate-300">Login, onboarding, permissões e multi-tenancy preparados para um SaaS de vendas de nível premium.</p>
          </div>
          <div className="grid max-w-lg grid-cols-3 gap-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Realtime</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">RLS segura</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Deploy Vercel</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 sm:p-8">{children}</div>
    </div>
  );
}
