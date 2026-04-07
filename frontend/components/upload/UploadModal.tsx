"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [result, setResult] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    try {
      const data = await api.transactions.upload(file);
      setResult(`${data.imported} transações importadas com sucesso!`);
      setStatus("done");
    } catch (e: unknown) {
      setResult(e instanceof Error ? e.message : "Erro ao importar");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-bg-card border border-border rounded-2xl p-6 w-96">
        <h2 className="text-base font-bold text-text-primary mb-1">Importar Extrato</h2>
        <p className="text-xs text-text-muted mb-5">PDF ou CSV do seu banco</p>

        {status === "idle" && (
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent-green/40 transition"
          >
            <p className="text-sm text-text-muted">Clique para selecionar o arquivo</p>
            <p className="text-xs text-text-faint mt-1">.pdf ou .csv</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {status === "uploading" && (
          <div className="text-center py-8 text-sm text-text-muted">
            Processando com Gemini...
          </div>
        )}

        {(status === "done" || status === "error") && (
          <div className={`rounded-lg p-4 text-sm ${status === "done" ? "bg-[#0f1a0f] text-accent-green" : "bg-[#1a0f0f] text-danger"}`}>
            {result}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          {status === "done" && (
            <button
              onClick={() => { onClose(); window.location.href = "/dashboard"; }}
              className="bg-accent-green text-bg-base text-sm font-bold px-4 py-2 rounded-lg"
            >
              Ver Dashboard
            </button>
          )}
          <button
            onClick={onClose}
            className="text-sm text-text-muted px-4 py-2 rounded-lg hover:text-text-secondary transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
