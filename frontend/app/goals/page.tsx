"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Goal } from "@/lib/types";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => { api.goals.list().then(setGoals); }, []);

  async function create() {
    if (!desc || !amount) return;
    await api.goals.create({ description: desc, target_amount: Number(amount), month });
    setDesc(""); setAmount("");
    api.goals.list().then(setGoals);
  }

  async function remove(id: number) {
    await api.goals.delete(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="p-5 max-w-xl">
      <p className="text-xs text-text-muted mb-4">Metas de <span className="text-text-primary font-semibold">{month}</span></p>
      <div className="bg-bg-card border border-border rounded-xl p-4 mb-4 flex gap-2">
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ex: Poupar R$500" className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-secondary outline-none" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor" type="number" className="w-28 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-secondary outline-none" />
        <button onClick={create} className="bg-accent-green text-bg-base text-sm font-bold px-4 py-2 rounded-lg">Criar</button>
      </div>
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {goals.map((g) => (
          <div key={g.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
            <span className="w-2 h-2 rounded-full bg-accent-green block shrink-0" />
            <span className="flex-1 text-sm text-text-secondary">{g.description}</span>
            <span className="text-sm text-text-muted">R$ {g.target_amount}</span>
            <button onClick={() => remove(g.id)} className="text-xs text-text-faint hover:text-danger transition ml-2">×</button>
          </div>
        ))}
        {goals.length === 0 && <p className="text-sm text-text-muted p-4 text-center">Nenhuma meta criada ainda.</p>}
      </div>
    </div>
  );
}
