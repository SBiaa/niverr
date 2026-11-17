"use client";
import { useRef, useState, useTransition } from "react";
import { saveWaTemplate } from "../../actions";
import { buildWaMessage, WA_KINDS, type WaKind } from "@/lib/waMessage";

export default function WaTemplateEditor({
  kind,
  partyId,
  initial,
  preview,
  base,
}: {
  kind: WaKind;
  partyId: string;
  initial: string | null;
  preview: { honoreeName: string; age: number | null; date: string; venueName: string };
  base: string;
}) {
  const { title, vars, defaultTemplate, sample } = WA_KINDS[kind];
  const [text, setText] = useState(initial?.trim() ? initial : defaultTemplate);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  const shown = buildWaMessage(
    { ...preview, date: new Date(preview.date) },
    kind,
    sample,
    kind === "guest" ? `${base}/c/abc123` : `${base}/f/exemplo`,
    text,
  );

  const insert = (v: string) => {
    const el = ref.current;
    const [a, b] = el ? [el.selectionStart, el.selectionEnd] : [text.length, text.length];
    setText(text.slice(0, a) + v + text.slice(b));
    setSaved(false);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(a + v.length, a + v.length);
    });
  };

  const save = () => {
    const fd = new FormData();
    fd.set("waTemplate", text.trim() === defaultTemplate ? "" : text);
    start(async () => {
      await saveWaTemplate(partyId, kind, fd);
      setSaved(true);
    });
  };

  return (
    <details className="card">
      <summary className="cursor-pointer font-bold">{title}</summary>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <textarea
            ref={ref}
            rows={9}
            className="input text-sm"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSaved(false);
            }}
          />
          <div className="flex flex-wrap gap-1">
            {vars.map(([v, d]) => (
              <button key={v} type="button" title={d} onClick={() => insert(v)} className="rounded-full bg-zinc-100 px-2 py-1 font-mono text-xs hover:bg-zinc-200">
                {v}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            Toque numa variável para inserir. Se esquecer o <code>{"{link}"}</code>, ele é colocado no final.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={pending} className="btn-primary">
              {pending ? "Salvando..." : saved ? "Salvo ✔" : "Salvar texto"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => { setText(defaultTemplate); setSaved(false); }}>
              Restaurar padrão
            </button>
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-zinc-500">Prévia{sample ? ` (${sample})` : ""}</p>
          <pre className="whitespace-pre-wrap break-words rounded-xl bg-emerald-50 p-3 font-sans text-sm">{shown}</pre>
        </div>
      </div>
    </details>
  );
}
