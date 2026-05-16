"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRIORITIES = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" }
];

export function CreateTaskButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const router = useRouter();

  function reset() {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setError(null);
  }

  async function handleCreate() {
    setError(null);
    if (!title.trim()) { setError("Título é obrigatório."); return; }
    if (!dueDate) { setError("Data de vencimento é obrigatória."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description, due_date: dueDate, priority, status: "todo" })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao criar tarefa");

      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      setError(String((err as Error).message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button id="create-task-btn" onClick={() => setOpen(true)} size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Nova tarefa
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nova tarefa</h2>
              <button onClick={() => { setOpen(false); reset(); }} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Título *</label>
                <Input id="task-title" placeholder="Ex: Enviar proposta revisada" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Descrição</label>
                <textarea
                  id="task-description"
                  placeholder="Detalhes da tarefa..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Vencimento *</label>
                  <Input id="task-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Prioridade</label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setOpen(false); reset(); }}>Cancelar</Button>
              <Button id="task-submit" onClick={handleCreate} disabled={loading}>
                {loading ? "Criando..." : "Criar tarefa"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
