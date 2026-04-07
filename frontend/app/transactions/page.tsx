"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Transaction } from "@/lib/types";
import EditTransactionModal from "@/components/transactions/EditTransactionModal";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { Pencil, Trash2 } from "lucide-react";

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtMonth(m: string) {
  const [year, month] = m.split("-");
  const names = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${names[parseInt(month) - 1]} ${year}`;
}

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    api.transactions.months().then((ms) => {
      setMonths(ms);
      if (ms.length > 0 && !ms.includes(month)) setMonth(ms[0]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setTxs([]);
    api.transactions.list(month).then((data) => {
      setTxs(data);
      setLoading(false);
    }).catch(console.error);
  }, [month]);

  async function handleDelete(id: number) {
    await api.transactions.delete(id).catch(console.error);
    setTxs((prev) => prev.filter((t) => t.id !== id));
    setConfirmDelete(null);
  }

  function handleSaved(updated: Transaction) {
    setTxs((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  const income = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="p-4 md:p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-text-muted">Transações —</span>
        {months.length > 1 ? (
          <div className="flex gap-1 flex-wrap">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setMonth(m)}
                className={`text-xs px-3 py-1 rounded-full transition ${
                  m === month
                    ? "bg-accent-green text-bg-base font-semibold"
                    : "text-text-muted hover:text-text-secondary border border-border"
                }`}
              >
                {fmtMonth(m)}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-text-primary font-semibold">{fmtMonth(month)}</span>
        )}
      </div>

      {/* Summary */}
      {!loading && txs.length > 0 && (
        <div className="flex gap-4 mb-4">
          <span className="text-xs text-text-muted">
            Receitas: <span className="text-success font-semibold">{fmt(income)}</span>
          </span>
          <span className="text-xs text-text-muted">
            Gastos: <span className="text-danger font-semibold">{fmt(expenses)}</span>
          </span>
          <span className="text-xs text-text-muted">
            {txs.length} transações
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {loading && (
          <>
            {[0,1,2,3,4].map((i) => <SkeletonRow key={i} />)}
          </>
        )}
        {!loading && txs.length === 0 && (
          <p className="text-sm text-text-muted p-6 text-center">Nenhuma transação. Importe um extrato.</p>
        )}
        {!loading && txs.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 group">
            <span className="text-xs text-text-muted w-20 shrink-0 hidden sm:block">{t.date}</span>
            <span className="text-sm text-text-secondary flex-1 truncate">{t.description}</span>
            <span className="text-xs text-text-muted w-24 text-center hidden sm:block">{t.category}</span>
            <span className={`text-sm font-semibold w-24 text-right shrink-0 ${t.amount < 0 ? "text-danger" : "text-success"}`}>
              {fmt(t.amount)}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
              <button
                onClick={() => setEditing(t)}
                className="text-text-muted hover:text-accent-green transition p-1"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => setConfirmDelete(t.id)}
                className="text-text-muted hover:text-danger transition p-1"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <EditTransactionModal
          tx={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-xs mx-4 flex flex-col gap-4">
            <h2 className="text-base font-bold text-text-primary">Excluir transação?</h2>
            <p className="text-sm text-text-muted">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="text-sm text-text-muted px-4 py-2 rounded-lg hover:text-text-secondary transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="bg-danger text-white text-sm font-bold px-4 py-2 rounded-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
