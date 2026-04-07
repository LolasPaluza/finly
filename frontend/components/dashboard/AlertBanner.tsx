export default function AlertBanner({ alerts }: { alerts: string[] }) {
  if (!alerts.length) return null;
  return (
    <div className="bg-[#1a0f0f] border border-[#3b1515] rounded-lg px-4 py-3 flex items-start gap-3">
      <span className="mt-1 w-2 h-2 rounded-full bg-danger shrink-0" />
      <p className="text-sm text-text-secondary">{alerts[0]}</p>
    </div>
  );
}
