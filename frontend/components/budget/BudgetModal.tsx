"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Budget } from "@/lib/types";
import { Trash2 } from "lucide-react";

const EXPENSE_CATEGORIES = ["Alimentação", "Moradia", "Transporte", "Lazer", "Saúde", "Educação", "Assinaturas", "Outros"];

export default function BudgetModal({ onClose }: { onClose: () => void }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.budgets.list().then(setBudgets).catch(console.error);
  }, []);

  async function handleSave() {
    const raw = parseFloat(limit.replace(",", "."));
    if (isNaN(raw) || raw <= 0) { setError("Valor inválido."); return; }
    setLoading(true);
    setError("");
    try {
      const saved = await api.budgets.upsert({ category, limit_amount: raw });
      setBudgets((prev) => {
        const exists = prev.find((b) => b.category === category);
        return exists
          ? prev.map((b) => (b.category === category ? saved : b))
          : [...prev, saved];
      });
      setLimit("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    await api.budgets.delete(id).catch(console.error);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

  function fmt(val: number) {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Orçamento por Categoria</h2>
          <p className="text-xs text-text-muted mt-0.5">Defina limites mensais de gasto</p>
        </div>

        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-green/50"
          >
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            placeholder="Limite (R$)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-28 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green/50"
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-accent-green text-bg-base text-sm font-bold px-3 py-2 rounded-lg disabled:opacity-50"
          >
            OK
          </button>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
          {budgets.length === 0 && (
            <p className="text-sm text-text-muted text-center py-3">Nenhum orçamento definido.</p>
          )}
          {budgets.map((b) => (
            <div key={b.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-elevated">
              <span className="flex-1 text-sm text-text-secondary">{b.category}</span>
              <span className="text-sm text-text-primary font-semibold">{fmt(b.limit_amount)}</span>
              <button onClick={() => handleDelete(b.id)} className="text-text-muted hover:text-danger transition">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="text-sm text-text-muted px-4 py-2 rounded-lg hover:text-text-secondary transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
