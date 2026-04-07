"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Transaction } from "@/lib/types";

const CATEGORIES = ["Receita", "Alimentação", "Moradia", "Transporte", "Lazer", "Saúde", "Educação", "Assinaturas", "Outros"];

export default function EditTransactionModal({
  tx,
  onClose,
  onSaved,
}: {
  tx: Transaction;
  onClose: () => void;
  onSaved: (updated: Transaction) => void;
}) {
  const [form, setForm] = useState({
    date: tx.date,
    description: tx.description,
    amount: String(Math.abs(tx.amount)),
    category: tx.category,
  });
  const [type, setType] = useState<"income" | "expense">(tx.amount >= 0 ? "income" : "expense");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.description || !form.amount || !form.date) {
      setError("Preencha todos os campos.");
      return;
    }
    const raw = parseFloat(form.amount.replace(",", "."));
    if (isNaN(raw) || raw <= 0) {
      setError("Valor inválido.");
      return;
    }
    const amount = type === "expense" ? -raw : raw;
    setLoading(true);
    setError("");
    try {
      const updated = await api.transactions.update(tx.id, {
        date: form.date,
        description: form.description,
        amount,
        category: form.category,
      });
      onSaved(updated);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Editar Transação</h2>
          <p className="text-xs text-text-muted mt-0.5">Corrija os dados da transação</p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-border">
          <button
            onClick={() => { setType("income"); set("category", "Receita"); }}
            className={`flex-1 py-2 text-sm font-semibold transition ${type === "income" ? "bg-success/20 text-success" : "text-text-muted hover:text-text-secondary"}`}
          >
            + Receita
          </button>
          <button
            onClick={() => { setType("expense"); if (form.category === "Receita") set("category", "Outros"); }}
            className={`flex-1 py-2 text-sm font-semibold transition ${type === "expense" ? "bg-danger/20 text-danger" : "text-text-muted hover:text-text-secondary"}`}
          >
            − Despesa
          </button>
        </div>

        <input
          type="text"
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green/50"
        />
        <input
          type="text"
          placeholder="Valor"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green/50"
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-green/50"
        />
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-green/50"
        >
          {(type === "income" ? ["Receita"] : CATEGORIES.filter((c) => c !== "Receita")).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2 mt-1">
          <button onClick={onClose} className="text-sm text-text-muted px-4 py-2 rounded-lg hover:text-text-secondary transition">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-accent-green text-bg-base text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
