"use client";

import { useEffect, useState } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CalEvent = {
  id: string;
  summary?: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  htmlLink?: string;
};

function formatEventTime(event: CalEvent) {
  const start = event.start.dateTime ?? event.start.date ?? "";
  const end = event.end.dateTime ?? event.end.date ?? "";
  if (!event.start.dateTime) {
    return new Date(start).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  const day = startDate.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
  const startTime = startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const endTime = endDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${startTime}–${endTime}`;
}

function isToday(event: CalEvent) {
  const start = event.start.dateTime ?? event.start.date ?? "";
  return new Date(start).toDateString() === new Date().toDateString();
}

export function CalendarView() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/events");
      const json = await res.json();
      if (json.connected === false) {
        setConnected(false);
        if (json.error) setError(json.error);
      } else {
        setConnected(true);
        setEvents(json.events ?? []);
      }
    } catch {
      setError("Erro ao carregar eventos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleConnect() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar.readonly",
        queryParams: { access_type: "offline", prompt: "consent" },
        redirectTo: `${window.location.origin}/auth/callback?next=/calendario`,
      },
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <RefreshCw className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-slate-200 bg-white py-20 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Conectar Google Calendar</h2>
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {error ?? "Conecte sua conta Google para ver seus próximos eventos aqui."}
          </p>
        </div>
        <Button onClick={handleConnect} className="gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Conectar Google Calendar
        </Button>
      </div>
    );
  }

  const todayEvents = events.filter(isToday);
  const upcomingEvents = events.filter((e) => !isToday(e));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white">
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </button>
      </div>

      {events.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">Nenhum evento próximo no seu calendário.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayEvents.length === 0 ? (
                <p className="text-sm text-slate-400">Sem eventos hoje.</p>
              ) : (
                todayEvents.map((event) => <EventCard key={event.id} event={event} highlight />)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Próximos eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhum evento próximo.</p>
              ) : (
                upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, highlight }: { event: CalEvent; highlight?: boolean }) {
  return (
    <a
      href={event.htmlLink ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-2xl border p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
        highlight
          ? "border-primary/30 bg-primary/5 dark:border-primary/20"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <p className="font-medium leading-snug">{event.summary ?? "(sem título)"}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatEventTime(event)}</p>
      {event.location && (
        <p className="mt-1 truncate text-xs text-slate-400">{event.location}</p>
      )}
    </a>
  );
}
