"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  initialEmail: string;
  initialName: string;
  initialRole: string;
  initialAvatarUrl: string | null;
  hasProfile: boolean;
};

export function AccountForm({ userId, initialEmail, initialName, initialRole, initialAvatarUrl, hasProfile }: Props) {
  const [name, setName] = useState(initialName);
  const [orgName, setOrgName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const router = useRouter();

  async function handleSave() {
    if (!name.trim()) {
      setMessage({ text: "Nome é obrigatório.", ok: false });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      let avatarUrl = initialAvatarUrl;
      if (file) {
        const supabase = createSupabaseBrowserClient();
        const filePath = `avatars/${userId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }

      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), orgName: orgName.trim(), avatarUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar perfil");

      setMessage({ text: "Perfil salvo com sucesso!", ok: true });
      router.refresh();
    } catch (err) {
      setMessage({ text: String((err as Error).message ?? err), ok: false });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      {!hasProfile && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <strong>Complete seu perfil</strong> para acessar o CRM. Preencha seu nome e confirme para continuar.
        </div>
      )}

      {/* Profile info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="mb-5 text-base font-semibold text-slate-950 dark:text-white">Informações pessoais</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Nome completo</label>
            <Input
              id="account-name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">E-mail</label>
            <Input id="account-email" value={initialEmail} readOnly className="cursor-not-allowed opacity-60" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Função</label>
            <Input id="account-role" value={initialRole} readOnly className="cursor-not-allowed opacity-60" />
          </div>
        </div>
      </div>

      {/* Avatar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="mb-5 text-base font-semibold text-slate-950 dark:text-white">Foto de perfil</h2>
        {initialAvatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={initialAvatarUrl} alt="Avatar atual" className="mb-3 h-16 w-16 rounded-full object-cover" />
        )}
        <input
          id="account-avatar"
          type="file"
          accept="image/*"
          className="text-sm text-slate-600 dark:text-slate-400"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Organization — only shown when creating profile for the first time */}
      {!hasProfile && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <h2 className="mb-5 text-base font-semibold text-slate-950 dark:text-white">Organização</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Nome da empresa (opcional)</label>
            <Input
              id="account-org"
              placeholder={`${initialEmail} org`}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          id="account-logout"
          variant="outline"
          onClick={handleLogout}
          className="text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:text-rose-400"
        >
          Sair da conta
        </Button>
        <div className="flex items-center gap-3">
          {message && (
            <p className={`text-sm ${message.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {message.text}
            </p>
          )}
          <Button id="account-save" onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
