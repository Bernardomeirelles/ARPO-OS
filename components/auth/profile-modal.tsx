"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
  }, [open]);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar perfil");
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
<div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>
    </Modal>
  );
}
