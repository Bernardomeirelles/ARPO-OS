import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const placeholders = ["WhatsApp", "Google Calendar", "Webhooks", "Slack"];

export function SettingsView() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {placeholders.map((item) => (
            <div key={item} className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
              <span>{item}</span>
              <Badge>Em breve</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipe e pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-500">
          <p>Gerencie roles, regras de acesso, etapas e tags com políticas seguras por organização.</p>
          <p>A próxima camada pode conectar formulários reais com Supabase e server actions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
