"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import UploadModal from "@/components/upload/UploadModal";
import PixBatchModal from "@/components/transactions/PixBatchModal";
import BudgetModal from "@/components/budget/BudgetModal";
import RecurringModal from "@/components/recurring/RecurringModal";

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [upload, setUpload] = useState(false);
  const [pix, setPix] = useState(false);
  const [budget, setBudget] = useState(false);
  const [recurring, setRecurring] = useState(false);

  return (
    <>
      <header className="bg-bg-base border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden text-text-muted hover:text-text-secondary transition p-1"
          >
            <Menu size={18} />
          </button>
          <span className="text-[17px] font-extrabold tracking-tight">
            fin<span className="text-accent-green">ly</span>
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          <button
            onClick={() => setRecurring(true)}
            className="border border-border text-text-muted text-xs font-semibold px-3 py-1.5 rounded-lg hover:text-text-secondary hover:border-accent-green/40 transition hidden sm:block"
          >
            Recorrências
          </button>
          <button
            onClick={() => setBudget(true)}
            className="border border-border text-text-muted text-xs font-semibold px-3 py-1.5 rounded-lg hover:text-text-secondary hover:border-accent-green/40 transition hidden sm:block"
          >
            Orçamento
          </button>
          <button
            onClick={() => setPix(true)}
            className="border border-border text-text-muted text-xs font-semibold px-3 py-1.5 rounded-lg hover:text-text-secondary hover:border-accent-green/40 transition hidden sm:block"
          >
            Pix
          </button>

          <button
            onClick={() => setUpload(true)}
            className="bg-accent-green text-bg-base text-xs font-bold px-3 py-1.5 rounded-lg hover:brightness-110 transition"
          >
            + Importar
          </button>
        </div>
      </header>
      {upload && <UploadModal onClose={() => setUpload(false)} />}
      {pix && <PixBatchModal onClose={() => setPix(false)} />}
      {budget && <BudgetModal onClose={() => setBudget(false)} />}
      {recurring && <RecurringModal onClose={() => setRecurring(false)} />}
    </>
  );
}
