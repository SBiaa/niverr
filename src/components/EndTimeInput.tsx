"use client";
import { useState } from "react";

/** Horário de término opcional, com botão para apagar (o campo de hora do navegador não tem). */
export default function EndTimeInput({ defaultValue }: { defaultValue?: string | null }) {
  const [v, setV] = useState(defaultValue ?? "");
  const [k, setK] = useState(0);
  return (
    <div className="flex gap-2">
      <input key={k} name="endTime" type="time" className="input" value={v} onChange={(e) => setV(e.target.value)} />
      <button
        type="button"
        onClick={() => { setV(""); setK((n) => n + 1); }}
        className="shrink-0 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-600"
        title="Sem horário de término"
      >
        Limpar
      </button>
    </div>
  );
}
