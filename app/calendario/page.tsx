import { AppShell } from "@/components/layout/app-shell";
import { CalendarView } from "@/components/calendario/calendar-view";

export const metadata = { title: "Calendário — ARPO CRM" };

export default function CalendarioPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Agenda</p>
          <h1 className="text-3xl font-semibold tracking-tight">Calendário</h1>
          <p className="text-sm text-slate-500">Seus eventos do Google Calendar.</p>
        </section>
        <CalendarView />
      </div>
    </AppShell>
  );
}
