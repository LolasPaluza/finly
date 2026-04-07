import type { TrendData } from "@/lib/types";

function fmt(val: number) {
  if (val >= 1000) return `R$${(val / 1000).toFixed(1)}k`;
  return `R$${val.toFixed(0)}`;
}

function fmtMonth(m: string) {
  const [, month] = m.split("-");
  const names = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return names[parseInt(month) - 1];
}

export default function TrendChart({ data }: { data: TrendData }) {
  if (!data.months.length) return null;

  const W = 600;
  const H = 140;
  const PAD = { top: 16, right: 16, bottom: 28, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allValues = [...data.income, ...data.expenses];
  const maxVal = Math.max(...allValues, 1);
  const n = data.months.length;

  function x(i: number) {
    return PAD.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  }
  function y(val: number) {
    return PAD.top + chartH - (val / maxVal) * chartH;
  }

  function polyline(values: number[]) {
    return values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  }

  function area(values: number[]) {
    const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    const base = `${x(n - 1)},${PAD.top + chartH} ${x(0)},${PAD.top + chartH}`;
    return `${pts} ${base}`;
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <p className="text-[11px] text-text-muted uppercase tracking-widest mb-3 font-semibold">
        Evolução Mensal
      </p>
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-green inline-block" />
          <span className="text-[10px] text-text-muted">Receita</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" />
          <span className="text-[10px] text-text-muted">Gastos</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const yPos = PAD.top + chartH * (1 - pct);
          return (
            <g key={pct}>
              <line x1={PAD.left} y1={yPos} x2={W - PAD.right} y2={yPos} stroke="#1c1c2e" strokeWidth="1" />
              <text x={PAD.left - 4} y={yPos + 4} textAnchor="end" fontSize="9" fill="#4b5563">
                {fmt(maxVal * pct)}
              </text>
            </g>
          );
        })}

        {/* Area fills */}
        <polygon points={area(data.income)} fill="#86efac" fillOpacity="0.08" />
        <polygon points={area(data.expenses)} fill="#f87171" fillOpacity="0.08" />

        {/* Lines */}
        <polyline points={polyline(data.income)} fill="none" stroke="#86efac" strokeWidth="1.5" strokeLinejoin="round" />
        <polyline points={polyline(data.expenses)} fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Dots */}
        {data.income.map((v, i) => (
          <circle key={`inc-${i}`} cx={x(i)} cy={y(v)} r="3" fill="#86efac" />
        ))}
        {data.expenses.map((v, i) => (
          <circle key={`exp-${i}`} cx={x(i)} cy={y(v)} r="3" fill="#f87171" />
        ))}

        {/* X-axis labels */}
        {data.months.map((m, i) => (
          <text key={m} x={x(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#4b5563">
            {fmtMonth(m)}
          </text>
        ))}
      </svg>
    </div>
  );
}
