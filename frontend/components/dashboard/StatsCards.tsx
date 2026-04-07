import type { DashboardData } from "@/lib/types";

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function StatsCards({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: "Receita", value: fmt(data.income), highlight: false },
        { label: "Gastos", value: fmt(data.expenses), highlight: false },
        { label: "Disponível", value: fmt(data.available), highlight: true },
        { label: "Poupado", value: fmt(data.saved), highlight: false },
      ].map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 ${
            card.highlight
              ? "bg-[#0f1a0f] border-accent-green/20"
              : "bg-bg-card border-border"
          }`}
        >
          <p className="text-[11px] text-text-muted mb-1">{card.label}</p>
          <p className={`text-xl font-extrabold ${card.highlight ? "text-accent-green" : "text-text-primary"}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
