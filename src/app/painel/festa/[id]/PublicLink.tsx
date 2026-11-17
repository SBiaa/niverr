"use client";
import { useState } from "react";

export default function PublicLink({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card mt-4 flex flex-col gap-3 border-pink-100 bg-pink-50/40 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 sm:flex-1">
        <p className="font-bold">🌐 Link geral da festa</p>
        <p className="text-sm text-zinc-600">
          Para mandar em grupos ou para quem não está na lista. A pessoa coloca nome e WhatsApp e confirma — ela entra
          na sua lista automaticamente.
        </p>
        <a href={url} target="_blank" className="mt-1 block truncate text-sm font-semibold text-pink-600">{url}</a>
      </div>
      <div className="flex gap-2">
      <button onClick={copy} className="btn-ghost flex-1 px-4 py-2 text-sm whitespace-nowrap sm:flex-none">{copied ? "Copiado! ✔" : "Copiar link"}</button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        className="btn-wa flex-1 px-4 py-2 text-center text-sm whitespace-nowrap sm:flex-none"
      >
        Compartilhar no WhatsApp
      </a>
      </div>
    </div>
  );
}
