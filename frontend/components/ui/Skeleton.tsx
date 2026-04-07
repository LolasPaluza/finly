export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-bg-elevated animate-pulse rounded-lg ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-32" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 flex-1" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
