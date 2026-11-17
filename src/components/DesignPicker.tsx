"use client";
import { useState } from "react";
import { DESIGNS, resolvePalette } from "@/lib/designs";
import DesignScene from "@/components/DesignScene";

/** Escolha do tema do convite + cores editáveis do tema (com prévia ao vivo). */
export default function DesignPicker({
  design,
  palette,
  photos,
  coverUrl,
  coverStyle,
}: {
  design?: string;
  palette?: string | null;
  /** fotos já enviadas (só na edição) para escolher a capa */
  photos?: { id: string; url: string }[];
  coverUrl?: string | null;
  coverStyle?: string;
}) {
  const [id, setId] = useState(DESIGNS[design ?? ""] ? design! : "padrao");
  // uma paleta por tema; o que veio salvo vale para o tema salvo
  const [all, setAll] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(Object.keys(DESIGNS).map((k) => [k, resolvePalette(k, k === design ? palette : null)])),
  );
  const [cover, setCover] = useState(coverUrl ?? "");
  const [style, setStyle] = useState(coverStyle === "fundo" ? "fundo" : "redonda");
  const def = DESIGNS[id];
  const colors = all[id];
  const setColors = (c: Record<string, string>) => setAll((a) => ({ ...a, [id]: c }));
  const classico = id === "padrao";
  const asBackground = classico && style === "fundo";
  // no clássico, a cor da película e do nome só aparecem quando a capa é o fundo
  const fields = def.fields.filter((f) => !classico || asBackground || f.key === "pageBg");

  return (
    <div>
      <label className="label">Tema do convite</label>
      <input type="hidden" name="design" value={id} />
      <input type="hidden" name="coverStyle" value={style} />
      {photos && <input type="hidden" name="coverUrl" value={cover} />}
      {def.fields.map((f) => (
        <input key={f.key} type="hidden" name={`p_${f.key}`} value={colors[f.key]} />
      ))}
      <div className="flex flex-wrap gap-2">
        {Object.values(DESIGNS).map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={id === d.id}
            onClick={() => setId(d.id)}
            className={`inline-block rounded-full border px-4 py-2 ${
              id === d.id ? "border-pink-500 bg-pink-50" : "border-zinc-200 bg-white"
            }`}
          >
            {d.emoji} {d.label}
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-zinc-500">{def.description}</p>

      {/* foto de capa: vale para todos os temas */}
      <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3">
        <p className="text-sm font-semibold text-zinc-700">Foto de capa</p>
        {photos ? (
          photos.length ? (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                aria-pressed={cover === ""}
                onClick={() => setCover("")}
                className={`h-16 w-16 shrink-0 rounded-xl border-2 text-xs text-zinc-500 ${
                  cover === "" ? "border-pink-500 bg-pink-50" : "border-zinc-200 bg-white"
                }`}
              >
                Sem capa
              </button>
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={cover === p.url}
                  aria-label="Usar como capa"
                  onClick={() => setCover(p.url)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                    cover === p.url ? "border-pink-500" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">Envie fotos na aba “Fotos” e volte aqui para escolher a capa.</p>
          )
        ) : (
          <p className="mt-1 text-xs text-zinc-500">Depois de criar a festa, você escolhe a foto de capa aqui.</p>
        )}

        {classico && (
          <div className="mt-3">
            <p className="text-sm font-semibold text-zinc-700">Como mostrar a capa</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { v: "redonda", t: "⭕ Foto redonda", d: "Círculo acima do nome" },
                { v: "fundo", t: "🖼️ Foto de fundo", d: "Ocupa todo o topo do convite" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  aria-pressed={style === o.v}
                  onClick={() => setStyle(o.v)}
                  className={`rounded-xl border px-3 py-2 text-left ${
                    style === o.v ? "border-pink-500 bg-pink-50" : "border-zinc-200 bg-white"
                  }`}
                >
                  <b className="text-sm">{o.t}</b>
                  <span className="block text-xs text-zinc-500">{o.d}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {(def.scene || classico) && (
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3">
          {def.scene ? (
            <div key={id} className="relative h-40 overflow-hidden rounded-xl">
              <DesignScene design={id} palette={colors} idPrefix="prev" className="h-full w-full" />
            </div>
          ) : (
            <div
              className="relative flex h-40 items-end justify-center overflow-hidden rounded-xl border border-zinc-100"
              style={{ background: colors.pageBg }}
            >
              {asBackground && cover && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0" style={{ background: colors.overlay, opacity: 0.4 }} />
                </>
              )}
              <p
                className="relative mb-4 text-3xl font-extrabold"
                style={{ color: asBackground && cover ? colors.titleText : "#27272a" }}
              >
                Nome da festa
              </p>
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {fields.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm">
                <input
                  type="color"
                  value={colors[f.key]}
                  onChange={(e) => setColors({ ...colors, [f.key]: e.target.value })}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-zinc-200 bg-white p-0.5"
                />
                <span className="leading-tight text-zinc-700">{f.label}</span>
              </label>
            ))}
          </div>
          {asBackground && !cover && (
            <p className="mt-2 text-xs text-amber-700">Escolha uma foto de capa acima para ver o fundo.</p>
          )}
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
