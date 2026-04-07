export default function AISuggestions({
  suggestions,
  loading,
}: {
  suggestions: string[];
  loading?: boolean;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <p className="text-[11px] text-text-muted uppercase tracking-widest mb-4 font-semibold">
        Sugestões da IA
      </p>
      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-border last:border-0">
              <span className="text-accent-green text-xs font-bold shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 flex flex-col gap-1.5 pt-0.5">
                <div className="h-2.5 bg-bg-elevated rounded animate-pulse w-full" />
                <div className="h-2.5 bg-bg-elevated rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && suggestions.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">
          Nenhuma sugestão disponível.
        </p>
      )}
      {!loading && suggestions.map((s, i) => (
        <div key={i} className="flex gap-3 py-3 border-b border-border last:border-0">
          <span className="text-accent-green text-xs font-bold shrink-0 mt-0.5">
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="text-sm text-text-muted leading-relaxed">{s}</p>
        </div>
      ))}
    </div>
  );
}
