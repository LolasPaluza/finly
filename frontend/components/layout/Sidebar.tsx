"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transações", href: "/transactions" },
];

const PLANNING = [
  { label: "Metas", href: "/goals" },
  { label: "Investimentos", href: "/investments" },
];

export default function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  const content = (
    <div className="w-48 bg-bg-base border-r border-border flex flex-col gap-1 px-3 py-4 h-full">
      <p className="text-[10px] text-text-faint uppercase tracking-widest px-3 pt-2 pb-1">Principal</p>
      {NAV.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          onClick={onClose}
          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === item.href
              ? "bg-bg-card text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {item.label}
        </Link>
      ))}
      <p className="text-[10px] text-text-faint uppercase tracking-widest px-3 pt-4 pb-1">Planejamento</p>
      {PLANNING.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          onClick={onClose}
          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === item.href
              ? "bg-bg-card text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex shrink-0">{content}</aside>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="relative z-50 flex shrink-0">
            <div className="w-48 bg-bg-base border-r border-border flex flex-col gap-1 px-3 py-4 h-full">
              <div className="flex justify-end mb-2">
                <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition">
                  <X size={16} />
                </button>
              </div>
              <p className="text-[10px] text-text-faint uppercase tracking-widest px-3 pb-1">Principal</p>
              {NAV.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? "bg-bg-card text-text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <p className="text-[10px] text-text-faint uppercase tracking-widest px-3 pt-4 pb-1">Planejamento</p>
              {PLANNING.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? "bg-bg-card text-text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
