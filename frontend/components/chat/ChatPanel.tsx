"use client";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";
import ChatMessageBubble from "./ChatMessage";

const SUGGESTIONS = ["onde gasto mais?", "posso investir?", "vs mês passado"];

export default function ChatPanel({ month }: { month: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", content: "Olá! Importe seu extrato e pergunte qualquer coisa sobre suas finanças." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api.chat(text, month);
      setMessages((prev) => [...prev, { role: "ai", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "Erro ao conectar. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="w-full md:w-[270px] bg-bg-base md:border-l border-border flex flex-col shrink-0 h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          <span className="text-sm font-semibold text-text-primary">Assistente</span>
        </div>
        <p className="text-[10px] text-text-faint mt-0.5">Gemini · baseado nos seus dados</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => <ChatMessageBubble key={i} msg={m} />)}
        {loading && <p className="text-xs text-text-muted">...</p>}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex flex-wrap gap-1 mb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="bg-bg-card border border-border rounded-full px-2 py-1 text-[10px] text-text-muted hover:text-text-secondary transition"
            >
              {s}
            </button>
          ))}
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Pergunte algo sobre suas finanças..."
          className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-xs text-text-secondary placeholder:text-text-faint outline-none focus:border-accent-green/30 transition"
        />
      </div>
    </aside>
  );
}
