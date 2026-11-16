"use client";
import { useState } from "react";
import { DESIGNS, resolvePalette } from "@/lib/designs";
import DesignScene from "@/components/DesignScene";

/** Escolha do tema do convite + cores editáveis do tema (com prévia ao vivo). */
export default function DesignPicker({ design, palette }: { design?: string; palette?: string | null }) {
  const [id, setId] = useState(DESIGNS[design ?? ""] ? design! : "padrao");
  // uma paleta por tema; o que veio salvo vale para o tema salvo
  const [all, setAll] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(Object.keys(DESIGNS).map((k) => [k, resolvePalette(k, k === design ? palette : null)])),
  );
  const def = DESIGNS[id];
  const colors = all[id];
  const setColors = (c: Record<string, string>) => setAll((a) => ({ ...a, [id]: c }));

  return (
    <div>
      <label className="label">Tema do convite</label>
      <div className="flex flex-wrap gap-2">
        {Object.values(DESIGNS).map((d) => (
          <label key={d.id} className="cursor-pointer">
            <input
              type="radio"
              name="design"
              value={d.id}
              checked={id === d.id}
              onChange={() => setId(d.id)}
              className="peer sr-only"
            />
            <span className="inline-block rounded-full border border-zinc-200 bg-white px-4 py-2 peer-checked:border-pink-500 peer-checked:bg-pink-50">
              {d.emoji} {d.label}
            </span>
          </label>
        ))}
      </div>
      <p className="mt-1 text-xs text-zinc-500">{def.description}</p>

      {def.scene && (
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3">
          <div key={id} className="relative h-40 overflow-hidden rounded-xl">
            <DesignScene design={id} palette={colors} idPrefix="prev" className="h-full w-full" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {def.fields.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm">
                <input
                  type="color"
                  name={`p_${f.key}`}
                  value={colors[f.key]}
                  onChange={(e) => setColors({ ...colors, [f.key]: e.target.value })}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-zinc-200 bg-white p-0.5"
                />
                <span className="leading-tight text-zinc-700">{f.label}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setColors({ ...def.palette })}
            className="mt-3 text-sm font-semibold text-zinc-500 underline"
          >
            Voltar às cores originais
          </button>
        </div>
      )}
    </div>
  );
}
