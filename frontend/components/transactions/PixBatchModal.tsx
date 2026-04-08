"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

const CATEGORIES = ["Alimentação", "Moradia", "Transporte", "Lazer", "Saúde", "Educação", "Assinaturas", "Outros"];

type Row = { id: number; date: string; description: string; amount: string; category: string };

let nextId = 1;

function emptyRow(): Row {
  const today = new Date().toISOString().slice(0, 10);
  return { id: nextId++, date: today, description: "", amount: "", category: "Outros" };
}

export default function PixBatchModal({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(0);
  const [error, setError] = useState("");

  function update(id: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSave() {
    const valid = rows.filter((r) => r.description.trim() && r.amount.trim());
    if (valid.length === 0) {
      setError("Preencha ao menos uma linha.");
      return;
    }

    for (const r of valid) {
      const raw = parseFloat(r.amount.replace(",", "."));
      if (isNaN(raw) || raw <= 0) {
        setError(`Valor inválido na linha "${r.description || "sem descrição"}".`);
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      await Promise.all(
        valid.map((r) =>
          api.transactions.create({
            date: r.date,
            description: r.description.trim(),
            amount: -Math.abs(parseFloat(r.amount.replace(",", "."))),
            category: r.category,
          })
        )
      );
      setDone(valid.length);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (done > 0) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-bg-card border border-border rounded-2xl p-6 w-96 flex flex-col gap-4">
          <div className="rounded-lg p-4 bg-[#0f1a0f] text-accent-green text-sm font-semibold">
            {done} Pix adicionado{done > 1 ? "s" : ""} com sucesso!
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setDone(0); setRows([emptyRow(), emptyRow(), emptyRow()]); }}
              className="text-sm text-text-muted px-4 py-2 rounded-lg hover:text-text-secondary transition"
            >
              Adicionar mais
            </button>
            <button
              onClick={() => { onClose(); window.location.href = "/transactions"; }}
              className="bg-accent-green text-bg-base text-sm font-bold px-4 py-2 rounded-lg"
            >
              Ver Transações
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-2xl">
        <h2 className="text-base font-bold text-text-primary mb-1">Adicionar Pix</h2>
        <p className="text-xs text-text-muted mb-5">Preencha os Pix que não aparecem na fatura. Linhas vazias são ignoradas.</p>

        {/* Cabeçalho */}
        <div className="grid grid-cols-[110px_1fr_110px_120px_32px] gap-2 mb-2 px-1">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Data</span>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Descrição</span>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Valor (R$)</span>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Categoria</span>
          <span />
        </div>

        {/* Linhas */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[110px_1fr_110px_120px_32px] gap-2 items-center">
              <input
                type="date"
                value={row.date}
                onChange={(e) => update(row.id, "date", e.target.value)}
                className="bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent-green/50 w-full"
              />
              <input
                type="text"
                placeholder="Ex: Pix para João"
                value={row.description}
                onChange={(e) => update(row.id, "description", e.target.value)}
                className="bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green/50 w-full"
              />
              <input
                type="number"
                placeholder="0,00"
                min="0"
                step="0.01"
                value={row.amount}
                onChange={(e) => update(row.id, "amount", e.target.value)}
                className="bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green/50 w-full"
              />
              <select
                value={row.category}
                onChange={(e) => update(row.id, "category", e.target.value)}
                className="bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent-green/50 w-full"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={() => removeRow(row.id)}
                className="text-text-muted hover:text-danger transition p-1"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Adicionar linha */}
        <button
          onClick={addRow}
          className="mt-3 flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-green transition"
        >
          <Plus size={13} />
          Adicionar linha
        </button>

        {error && <p className="text-xs text-danger mt-3">{error}</p>}

        {/* Ações */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="text-sm text-text-muted px-4 py-2 rounded-lg hover:text-text-secondary transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-accent-green text-bg-base text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? "Salvando..." : `Salvar ${rows.filter((r) => r.description.trim() && r.amount.trim()).length || ""} Pix`}
          </button>
        </div>
      </div>
    </div>
  );
}
