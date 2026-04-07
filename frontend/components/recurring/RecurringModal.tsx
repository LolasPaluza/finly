"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { RecurringTransaction } from "@/lib/types";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const CATEGORIES = ["Receita", "Alimentação", "Moradia", "Transporte", "Lazer", "Saúde", "Educação", "Assinaturas", "Outros"];

export default function RecurringModal({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState<RecurringTransaction[]>([]);
  const [form, setForm] = useState({ description: "", amount: "", category: "Receita" });
  const [type, setType] = useState<"income" | "expense">("income");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applyMonth, setApplyMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [applyMsg, setApplyMsg] = useState("");

  useEffect(() => {
    api.recurring.list().then(setList).catch(console.error);
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAdd() {
    if (!form.description || !form.amount) { setError("Preencha todos os campos."); return; }
    const raw = parseFloat(form.amount.replace(",", "."));
    if (isNaN(raw) || raw <= 0) { setError("Valor inválido."); return; }
    const amount = type === "expense" ? -raw : raw;
    setLoading(true);
    setError("");
    try {
      const rec = await api.recurring.create({ description: form.description, amount, category: form.category });
      setList((prev) => [...prev, rec]);
      setForm({ description: "", amount: "", category: "Receita" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(rec: RecurringTransaction) {
    const updated = await api.recurring.update(rec.id, { is_active: !rec.is_active }).catch(console.error);
    if (updated) setList((prev) => prev.map((r) => (r.id === rec.id ? updated : r)));
  }

  async function handleDelete(id: number) {
    await api.recurring.delete(id).catch(console.error);
    setList((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleApply() {
    setApplyMsg("");
    try {
      const { applied } = await api.recurring.apply(applyMonth);
      setApplyMsg(`${applied} transação(ões) aplicada(s) em ${applyMonth}.`);
    } catch (e: unknown) {
      setApplyMsg(e instanceof Error ? e.message : "Erro.");
    }
  }

  function fmt(val: number) {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Transações Recorrentes</h2>
          <p className="text-xs text-text-muted mt-0.5">Salário, aluguel, assinaturas fixas</p>
        </div>

        {/* Add form */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          <button
            onClick={() => { setType("income"); set("category", "Receita"); }}
            className={`flex-1 py-1.5 text-xs font-semibold transition ${type === "income" ? "bg-success/20 text-success" : "text-text-muted"}`}
          >
            + Receita
          </button>
          <button
            onClick={() => { setType("expense"); set("category", "Outros"); }}
            className={`flex-1 py-1.5 text-xs font-semibold transition ${type === "expense" ? "bg-danger/20 text-danger" : "text-text-muted"}`}
          >
            − Despesa
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green/50"
          />
          <input
            type="text"
            placeholder="Valor"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            className="w-24 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green/50"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-green/50"
          >
            {(type === "income" ? ["Receita"] : CATEGORIES.filter((c) => c !== "Receita")).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-accent-green text-bg-base text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        {/* List */}
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
          {list.length === 0 && (
            <p className="text-sm text-text-muted text-center py-2">Nenhuma recorrência cadastrada.</p>
          )}
          {list.map((rec) => (
            <div key={rec.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${rec.is_active ? "bg-bg-elevated" : "bg-bg-elevated opacity-50"}`}>
              <span className="flex-1 text-sm text-text-secondary truncate">{rec.description}</span>
              <span className={`text-sm font-semibold ${rec.amount >= 0 ? "text-success" : "text-danger"}`}>
                {fmt(rec.amount)}
              </span>
              <button onClick={() => handleToggle(rec)} className="text-text-muted hover:text-accent-green transition">
                {rec.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              </button>
              <button onClick={() => handleDelete(rec.id)} className="text-text-muted hover:text-danger transition">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Apply to month */}
        <div className="border-t border-border pt-3 flex items-center gap-2">
          <span className="text-xs text-text-muted">Aplicar em</span>
          <input
            type="month"
            value={applyMonth}
            onChange={(e) => setApplyMonth(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-accent-green/50"
          />
          <button
            onClick={handleApply}
            className="bg-bg-elevated border border-border text-text-secondary text-xs font-semibold px-3 py-1.5 rounded-lg hover:border-accent-green/40 transition"
          >
            Aplicar
          </button>
          {applyMsg && <span className="text-xs text-accent-green">{applyMsg}</span>}
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
