"use client";
import { useEffect } from "react";
import { reportError } from "@/components/ErrorReporter";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error.message + (error.digest ? ` (digest ${error.digest})` : ""), error.stack);
  }, [error]);
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <p className="text-5xl">😵</p>
      <h1 className="mt-4 text-xl font-bold">Ops, algo deu errado</h1>
      <p className="mt-2 text-zinc-600">Já avisamos a nossa equipe. Tente de novo.</p>
      <button className="btn-primary mt-6" onClick={reset}>Tentar de novo</button>
    </main>
  );
}
