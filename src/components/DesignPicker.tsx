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
  profileUrl,
  profileSize,
  profileFit,
}: {
  design?: string;
  palette?: string | null;
  /** fotos já enviadas (só na edição) para escolher a capa */
  photos?: { id: string; url: string }[];
  coverUrl?: string | null;
  profileUrl?: string | null;
  profileSize?: number;
  profileFit?: string;
}) {
  const [id, setId] = useState(DESIGNS[design ?? ""] ? design! : "padrao");
  // uma paleta por tema; o que veio salvo vale para o tema salvo
  const [all, setAll] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(Object.keys(DESIGNS).map((k) => [k, resolvePalette(k, k === design ? palette : null)])),
  );
  const [cover, setCover] = useState(coverUrl ?? "");
  const [profile, setProfile] = useState(profileUrl ?? "");
  const [fit, setFit] = useState(profileFit === "contain");
  const [size, setSize] = useState(profileSize ?? 176);
  const def = DESIGNS[id];
  const colors = all[id];
  const setColors = (c: Record<string, string>) => setAll((a) => ({ ...a, [id]: c }));
  const classico = id === "padrao";
  const asBackground = classico && !!cover;
  // no clássico, a cor da película e do nome só aparecem quando a capa é o fundo
  const fields = def.fields.filter((f) => !classico || asBackground || f.key === "pageBg");

  return (
    <div>
      <label className="label">Tema do convite</label>
      <input type="hidden" name="design" value={id} />
      {photos && <input type="hidden" name="coverUrl" value={cover} />}
      {photos && <input type="hidden" name="profileUrl" value={profile} />}
      {photos && !profile && <input type="hidden" name="profileSize" value={size} />}
      {photos && !profile && fit && <input type="hidden" name="profileFit" value="contain" />}
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

      {/* fotos do convite: valem para todos os temas */}
      <div className="mt-3 space-y-4 rounded-2xl border border-zinc-200 bg-white p-3">
        {photos ? (
          photos.length ? (
            <>
              {classico && <PhotoPick label="Foto de fundo (capa do topo)" photos={photos} value={cover} onChange={setCover} none="Sem fundo" />}
              <PhotoPick label="Foto do aniversariante (redonda)" photos={photos} value={profile} onChange={setProfile} none="Sem foto" />
              {profile && (
                <label className="block text-sm text-zinc-700">
                  <span className="font-semibold">Tamanho da foto do aniversariante</span>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      type="range"
                      name="profileSize"
                      min={96}
                      max={320}
                      step={8}
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile} alt="" className={`shrink-0 ${fit ? "h-auto rounded-md" : "rounded-full object-cover"}`} style={{ width: size / 4, ...(fit ? {} : { height: size / 4 }) }} />
                  </div>
                </label>
              )}
              {profile && (
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input type="checkbox" name="profileFit" value="contain" checked={fit} onChange={(e) => setFit(e.target.checked)} className="h-4 w-4" />
                  Mostrar a foto inteira, sem o recorte redondo (bom quando a foto tem nome ou texto escrito)
                </label>
              )}
            </>
          ) : (
            <p className="text-xs text-zinc-500">Envie fotos na aba “Fotos” e volte aqui para escolher a foto de fundo e a do aniversariante.</p>
          )
        ) : (
          <p className="text-xs text-zinc-500">Depois de criar a festa, você escolhe as fotos do convite aqui.</p>
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
              {asBackground && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0" style={{ background: colors.overlay, opacity: 0.4 }} />
                </>
              )}
              <p
                className="relative mb-4 text-3xl font-extrabold"
                style={{ color: asBackground ? colors.titleText : "#27272a" }}
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

function PhotoPick({
  label,
  photos,
  value,
  onChange,
  none,
}: {
  label: string;
  photos: { id: string; url: string }[];
  value: string;
  onChange: (v: string) => void;
  none: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-zinc-700">{label}</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          aria-pressed={value === ""}
          onClick={() => onChange("")}
          className={`h-16 w-16 shrink-0 rounded-xl border-2 text-xs text-zinc-500 ${
            value === "" ? "border-pink-500 bg-pink-50" : "border-zinc-200 bg-white"
          }`}
        >
          {none}
        </button>
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={value === p.url}
            aria-label={label}
            onClick={() => onChange(p.url)}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
              value === p.url ? "border-pink-500" : "border-transparent"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
