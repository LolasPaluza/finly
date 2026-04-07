"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

const OPTIONS = [
  { name: "Tesouro Selic", risk: "Baixo", return: "~12% a.a.", min: "R$ 100", desc: "Liquidez diária. Ideal para reserva de emergência." },
  { name: "CDB 100% CDI", risk: "Baixo", return: "~12% a.a.", min: "R$ 1.000", desc: "Rende igual ao CDI. Coberto pelo FGC até R$250k." },
  { name: "LCI / LCA", risk: "Baixo", return: "~11% a.a.", min: "R$ 1.000", desc: "Isento de IR para pessoa física. Prazo mínimo 90 dias." },
];

export default function InvestmentsPage() {
  const [available, setAvailable] = useState<number | null>(null);
  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    api.dashboard(month).then((d: DashboardData) => setAvailable(d.available)).catch(() => setAvailable(0));
  }, [month]);

  return (
    <div className="p-5 max-w-xl">
      <p className="text-xs text-text-muted mb-1">Sugestões de investimento</p>
      {available !== null && (
        <p className="text-sm text-text-secondary mb-5">
          Você tem <span className="text-accent-green font-semibold">R$ {available.toFixed(2)}</span> disponíveis este mês.
        </p>
      )}
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <div key={opt.name} className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-semibold text-text-primary">{opt.name}</p>
              <span className="text-[10px] bg-[#0f1a0f] text-accent-green border border-accent-green/20 rounded-full px-2 py-0.5">{opt.risk}</span>
            </div>
            <p className="text-xs text-text-muted mb-2">{opt.desc}</p>
            <div className="flex gap-4 text-xs text-text-faint">
              <span>Retorno: <span className="text-text-muted">{opt.return}</span></span>
              <span>Mínimo: <span className="text-text-muted">{opt.min}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
