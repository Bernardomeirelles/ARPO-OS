"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function QuickLead() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // fetch profile to get organization_id
      const { data: profile } = await supabase.from("user_profiles").select("organization_id").eq("id", user.id).single();
      const orgId = profile?.organization_id;
      if (!orgId) throw new Error("Organização não encontrada");

      const lead = {
        organization_id: orgId,
        name,
        company,
        email,
        phone: "",
        position: "",
        source: "Manual",
        status: "novo",
        pipeline_stage: "Novo",
        owner_id: user.id,
        tags: [],
        notes: "",
        value: 0
      } as any;

      const { error } = await supabase.from("leads").insert(lead);
      if (error) throw error;

      setName("");
      setCompany("");
      setEmail("");
      setOpen(false);
      alert("Lead criado com sucesso");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert(String((err as any)?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={() => setOpen(true)} size="sm">Novo lead</Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[420px] rounded bg-white p-6">
            <h3 className="mb-3 text-lg font-medium">Criar lead rápido</h3>
            <div className="space-y-2">
              <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Empresa" value={company} onChange={(e) => setCompany(e.target.value)} />
              <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={create} disabled={loading}>{loading ? 'Criando...' : 'Criar'}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
