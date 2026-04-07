import type { DashboardData } from "@/lib/types";

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CategoryBars({ data }: { data: DashboardData }) {
  const entries = Object.entries(data.by_category).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] ?? 1;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <p className="text-[11px] text-text-muted uppercase tracking-widest mb-4 font-semibold">
        Distribuição de Gastos
      </p>
      {entries.map(([cat, val]) => {
        const limit = data.budgets?.[cat];
        const pct = limit ? Math.min((val / limit) * 100, 100) : (val / max) * 100;
        const overBudget = limit && val > limit;
        const nearBudget = limit && val >= limit * 0.8 && !overBudget;
        const barColor = overBudget ? "bg-danger" : nearBudget ? "bg-yellow-400" : "bg-accent-green";

        return (
          <div key={cat} className="mb-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm text-text-secondary w-28 shrink-0">{cat}</span>
              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-1 rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-text-muted w-24 text-right">{fmt(val)}</span>
            </div>
            {limit && (
              <div className="pl-[7.5rem]">
                <span className={`text-[10px] ${overBudget ? "text-danger" : "text-text-faint"}`}>
                  {overBudget ? `Excedeu em ${fmt(val - limit)}` : `Limite: ${fmt(limit)}`}
                </span>
              </div>
            )}
          </div>
        );
      })}
      {entries.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">Nenhum gasto este mês.</p>
      )}
    </div>
  );
}
