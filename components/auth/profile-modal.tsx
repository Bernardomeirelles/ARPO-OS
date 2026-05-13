"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setFile(null);
  }, [open]);

  async function handleSave() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Ensure organization exists: create a personal organization if none
      const orgRes = await supabase.from("organizations").insert({ name: `${user.email} org` }).select("id").limit(1).maybeSingle();
      const orgId = orgRes.data?.id ?? orgRes?.data?.id ?? null;

      let avatarUrl: string | null = null;

      if (file) {
        const filePath = `avatars/${user.id}/${Date.now()}-${file.name}`;
        const upload = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
        if (upload.error) throw upload.error;
        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }

      const profile = {
        id: user.id,
        organization_id: orgId,
        name: name || user.user_metadata?.name || "",
        email: user.email,
        avatar_url: avatarUrl
      };

      const { error } = await supabase.from("user_profiles").upsert(profile);
      if (error) throw error;

      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert(String((err as any)?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={(v) => (v ? undefined : onClose())}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Complete seu perfil</h3>
        <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>
    </Modal>
  );
}
