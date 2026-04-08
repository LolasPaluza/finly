"use client";
import { useState, useRef } from "react";
import { api } from "@/lib/api";

type DocType = "extrato" | "fatura";
type Step = "choose" | "uploading" | "pix_prompt" | "pix_uploading" | "done" | "error";

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const [docType, setDocType] = useState<DocType | null>(null);
  const [step, setStep] = useState<Step>("choose");
  const [imported, setImported] = useState(0);
  const [pixImported, setPixImported] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Renda extra
  const [showIncome, setShowIncome] = useState(false);
  const [incomeDesc, setIncomeDesc] = useState("Salário");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeSaved, setIncomeSaved] = useState(false);

  const mainRef = useRef<HTMLInputElement>(null);
  const pixRef = useRef<HTMLInputElement>(null);

  async function handleMainFile(file: File) {
    if (!docType) return;
    setStep("uploading");
    try {
      const data = await api.transactions.upload(file, docType);
      setImported(data.imported);
      // Fatura: perguntar sobre Pix do extrato
      if (docType === "fatura") {
        setStep("pix_prompt");
      } else {
        setStep("done");
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Erro ao importar");
      setStep("error");
    }
  }

  async function handlePixFile(file: File) {
    setStep("pix_uploading");
    try {
      const data = await api.transactions.upload(file, "pix_only");
      setPixImported(data.imported);
      setStep("done");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Erro ao importar Pix");
      setStep("error");
    }
  }

  async function handleAddIncome() {
    const amount = parseFloat(incomeAmount.replace(",", "."));
    if (!amount || amount <= 0) return;
    const today = new Date().toISOString().slice(0, 10);
    await api.transactions.create({
      date: today,
      description: incomeDesc || "Renda",
      amount: Math.abs(amount),
      category: "Receita",
    });
    setIncomeSaved(true);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-bg-card border border-border rounded-2xl p-6 w-[420px]">

        <h2 className="text-base font-bold text-text-primary mb-1">Importar Extrato</h2>
        <p className="text-xs text-text-muted mb-5">PDF ou CSV do seu banco ou cartão</p>

        {/* Etapa 1: escolha o tipo + upload */}
        {step === "choose" && (
          <>
            <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Tipo de arquivo
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => setDocType("extrato")}
                className={`rounded-xl border p-4 text-left transition ${
                  docType === "extrato"
                    ? "border-accent-green bg-[#0f1a0f]"
                    : "border-border hover:border-accent-green/40"
                }`}
              >
                <p className="text-sm font-bold text-text-primary mb-1">Extrato Bancário</p>
                <p className="text-xs text-text-muted">Entradas e saídas (conta corrente, poupança)</p>
              </button>
              <button
                onClick={() => setDocType("fatura")}
                className={`rounded-xl border p-4 text-left transition ${
                  docType === "fatura"
                    ? "border-accent-green bg-[#0f1a0f]"
                    : "border-border hover:border-accent-green/40"
                }`}
              >
                <p className="text-sm font-bold text-text-primary mb-1">Fatura de Cartão</p>
                <p className="text-xs text-text-muted">Somente despesas do cartão de crédito</p>
              </button>
            </div>

            <div
              onClick={() => docType && mainRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                docType
                  ? "cursor-pointer hover:border-accent-green/40 border-border"
                  : "border-border/40 opacity-40 cursor-not-allowed"
              }`}
            >
              <p className="text-sm text-text-muted">
                {docType ? "Clique para selecionar o arquivo" : "Selecione o tipo acima primeiro"}
              </p>
              <p className="text-xs text-text-faint mt-1">.pdf ou .csv</p>
              <input
                ref={mainRef}
                type="file"
                accept=".pdf,.csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleMainFile(e.target.files[0])}
              />
            </div>
          </>
        )}

        {/* Processando arquivo principal */}
        {step === "uploading" && (
          <div className="text-center py-10">
            <div className="inline-block w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-text-muted">Processando {docType === "fatura" ? "fatura" : "extrato"}...</p>
            <p className="text-xs text-text-faint mt-1">Isso pode levar alguns segundos</p>
          </div>
        )}

        {/* Passo extra: Pix do extrato (só para fatura) */}
        {step === "pix_prompt" && (
          <div className="space-y-4">
            <div className="rounded-lg p-3 bg-[#0f1a0f] text-accent-green text-sm font-semibold">
              {imported} lançamento{imported !== 1 ? "s" : ""} da fatura importado{imported !== 1 ? "s" : ""}!
            </div>

            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-bold text-text-primary mb-1">Importar Pix do extrato?</p>
              <p className="text-xs text-text-muted mb-4">
                Faça upload do extrato bancário do mesmo período — o sistema vai extrair <strong>apenas os Pix enviados</strong>, ignorando o resto.
              </p>
              <div
                onClick={() => pixRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-accent-green/40 transition"
              >
                <p className="text-sm text-text-muted">Selecionar extrato bancário</p>
                <p className="text-xs text-text-faint mt-1">.pdf ou .csv</p>
                <input
                  ref={pixRef}
                  type="file"
                  accept=".pdf,.csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePixFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>
        )}

        {/* Processando Pix */}
        {step === "pix_uploading" && (
          <div className="text-center py-10">
            <div className="inline-block w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-text-muted">Buscando Pix no extrato...</p>
            <p className="text-xs text-text-faint mt-1">Isso pode levar alguns segundos</p>
          </div>
        )}

        {/* Erro */}
        {step === "error" && (
          <div className="rounded-lg p-4 text-sm bg-[#1a0f0f] text-danger mb-4">
            {errorMsg}
          </div>
        )}

        {/* Concluído */}
        {step === "done" && (
          <div className="space-y-4">
            <div className="rounded-lg p-4 bg-[#0f1a0f] text-accent-green text-sm font-semibold space-y-1">
              <p>{imported} lançamento{imported !== 1 ? "s" : ""} importado{imported !== 1 ? "s" : ""} da {docType === "fatura" ? "fatura" : "extrato"}</p>
              {pixImported > 0 && (
                <p className="text-xs font-normal opacity-80">+ {pixImported} Pix importado{pixImported !== 1 ? "s" : ""} do extrato</p>
              )}
            </div>

            {/* Renda */}
            {!incomeSaved ? (
              <div className="border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-text-primary mb-1">Recebeu renda neste mês?</p>
                <p className="text-xs text-text-muted mb-3">Salário, freelance, Pix recebido, etc.</p>
                {!showIncome ? (
                  <button
                    onClick={() => setShowIncome(true)}
                    className="text-xs text-accent-green hover:underline"
                  >
                    + Adicionar renda
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={incomeDesc}
                      onChange={(e) => setIncomeDesc(e.target.value)}
                      placeholder="Descrição (ex: Salário)"
                      className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-green"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={incomeAmount}
                        onChange={(e) => setIncomeAmount(e.target.value)}
                        placeholder="Valor em R$"
                        min="0"
                        step="0.01"
                        className="flex-1 bg-bg-base border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-green"
                      />
                      <button
                        onClick={handleAddIncome}
                        className="bg-accent-green text-bg-base text-sm font-bold px-4 py-2 rounded-lg"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg p-3 bg-[#0f1a0f] text-accent-green text-xs">
                Renda adicionada!
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-end gap-2 mt-5">
          {step === "done" && (
            <button
              onClick={() => { onClose(); window.location.href = "/dashboard"; }}
              className="bg-accent-green text-bg-base text-sm font-bold px-4 py-2 rounded-lg"
            >
              Ver Dashboard
            </button>
          )}
          {step === "pix_prompt" && (
            <button
              onClick={() => setStep("done")}
              className="text-sm text-text-muted px-4 py-2 rounded-lg hover:text-text-secondary transition"
            >
              Pular
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
