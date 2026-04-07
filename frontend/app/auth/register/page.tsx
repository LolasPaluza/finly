"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.auth.register({ name, email, password });
      router.push("/auth/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <form onSubmit={submit} className="bg-bg-card border border-border rounded-2xl p-8 w-80">
        <h1 className="text-lg font-extrabold mb-1">fin<span className="text-accent-green">ly</span></h1>
        <p className="text-xs text-text-muted mb-6">Crie sua conta gratuita</p>
        {error && <p className="text-xs text-danger mb-4">{error}</p>}
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-secondary outline-none mb-3" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-secondary outline-none mb-3" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-secondary outline-none mb-5" />
        <button type="submit" className="w-full bg-accent-green text-bg-base font-bold py-2 rounded-lg text-sm">Criar conta</button>
        <p className="text-xs text-text-muted text-center mt-4">
          Já tem conta?{" "}
          <Link href="/auth/login" className="text-accent-green">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
