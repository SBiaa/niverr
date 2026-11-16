"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "./actions";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, undefined);
  return (
    <main className="bg-confetti flex min-h-screen items-center justify-center p-4">
      <form action={action} className="card w-full max-w-sm space-y-4">
        <Link href="/" className="font-fun block text-center text-2xl font-bold text-pink-600">niverr 🎂</Link>
        <h1 className="text-center text-lg font-bold">
          {mode === "login" ? "Entrar no painel" : "Criar conta grátis"}
        </h1>
        {mode === "signup" && (
          <div>
            <label className="label">Seu nome</label>
            <input name="name" className="input" required />
          </div>
        )}
        <div>
          <label className="label">E-mail</label>
          <input name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label">Senha</label>
          <input name="password" type="password" className="input" required minLength={6} />
        </div>
        {state?.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
        <p className="text-center text-sm text-zinc-600">
          {mode === "login" ? (
            <>Não tem conta? <Link href="/cadastro" className="font-semibold text-pink-600">Cadastre-se</Link></>
          ) : (
            <>Já tem conta? <Link href="/entrar" className="font-semibold text-pink-600">Entrar</Link></>
          )}
        </p>
      </form>
    </main>
  );
}
