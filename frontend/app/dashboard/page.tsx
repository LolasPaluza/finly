"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DashboardData, TrendData } from "@/lib/types";
import StatsCards from "@/components/dashboard/StatsCards";
import CategoryBars from "@/components/dashboard/CategoryBars";
import AlertBanner from "@/components/dashboard/AlertBanner";
import AISuggestions from "@/components/dashboard/AISuggestions";
import TrendChart from "@/components/dashboard/TrendChart";
import ChatPanel from "@/components/chat/ChatPanel";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { MessageCircle, X } from "lucide-react";

function fmt(m: string) {
  const [year, month] = m.split("-");
  const names = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${names[parseInt(month) - 1]} ${year}`;
}

export default function DashboardPage() {
  const [months, setMonths] = useState<string[]>([]);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<DashboardData | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    api.transactions.months().then((ms) => {
      setMonths(ms);
      if (ms.length > 0 && !ms.includes(month)) {
        setMonth(ms[0]);
      }
    }).catch(console.error);
    api.dashboardTrends().then(setTrends).catch(console.error);
  }, []);

  useEffect(() => {
    setData(null);
    setSuggestions([]);
    setSuggestionsLoading(true);
    api.dashboard(month).then(setData).catch(console.error);
    api.dashboardSuggestions(month)
      .then((r) => setSuggestions(r.suggestions))
      .catch(console.error)
      .finally(() => setSuggestionsLoading(false));
  }, [month]);

  return (
    <div className="flex h-full overflow-hidden relative">
      <div className="flex-1 p-4 md:p-5 flex flex-col gap-4 overflow-y-auto">
        {/* Month selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-muted">Visão geral —</span>
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
                  {fmt(m)}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs text-text-primary font-semibold">{fmt(month)}</span>
          )}
        </div>

        {/* Stats */}
        {!data ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0,1,2,3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <StatsCards data={data} />
        )}

        {data && <AlertBanner alerts={data.alerts} />}

        {/* Charts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data ? <CategoryBars data={data} /> : <div className="bg-bg-card border border-border rounded-xl p-4 h-48 animate-pulse" />}
          <AISuggestions suggestions={suggestions} loading={suggestionsLoading} />
        </div>

        {/* Trend chart */}
        {trends && trends.months.length > 1 && <TrendChart data={trends} />}
      </div>

      {/* Desktop chat */}
      <div className="hidden md:flex">
        <ChatPanel month={month} />
      </div>

      {/* Mobile chat toggle */}
      <button
        onClick={() => setChatOpen(true)}
        className="md:hidden fixed bottom-4 right-4 bg-accent-green text-bg-base rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-30"
      >
        <MessageCircle size={20} />
      </button>

      {/* Mobile chat overlay */}
      {chatOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col bg-bg-base">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-text-primary">Assistente</span>
            <button onClick={() => setChatOpen(false)} className="text-text-muted hover:text-text-secondary">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatPanel month={month} />
          </div>
        </div>
      )}
    </div>
  );
}
