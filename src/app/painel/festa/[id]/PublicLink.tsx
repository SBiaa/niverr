"use client";
import { useState } from "react";

export default function PublicLink({ url, honoree }: { url: string; honoree: string }) {
  const [copied, setCopied] = useState(false);
  const text = `🎉 Você está convidado(a) para o aniversário de ${honoree}!\nVeja os detalhes e confirme sua presença:\n${url}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card mt-4 flex flex-wrap items-center gap-3 border-pink-100 bg-pink-50/40 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-bold">🌐 Link geral da festa</p>
        <p className="text-sm text-zinc-600">
          Para mandar em grupos ou para quem não está na lista. A pessoa coloca nome e WhatsApp e confirma — ela entra
          na sua lista automaticamente.
        </p>
        <a href={url} target="_blank" className="mt-1 block truncate text-sm font-semibold text-pink-600">{url}</a>
      </div>
      <button onClick={copy} className="btn-ghost px-4 py-2 text-sm">{copied ? "Copiado! ✔" : "Copiar link"}</button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        className="btn-wa px-4 py-2 text-sm"
      >
        Compartilhar no WhatsApp
      </a>
    </div>
  );
}
