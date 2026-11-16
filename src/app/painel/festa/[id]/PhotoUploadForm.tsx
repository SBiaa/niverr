"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPhoto } from "../../actions";

const MAX_SIDE = 1600;
const MAX_FILES = 20;

async function shrink(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // formato que o navegador não decodifica (ex.: HEIC em alguns navegadores)
  }
}

type Item = { id: string; file: File; url: string; state: "idle" | "sending" | "done" | "error" };

export default function PhotoUploadForm({ partyId }: { partyId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  useEffect(() => () => items.forEach((i) => URL.revokeObjectURL(i.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  function add(list: FileList | null) {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setItems((prev) => {
      const room = MAX_FILES - prev.length;
      if (imgs.length > room) setError(`Máximo de ${MAX_FILES} fotos por vez.`);
      else setError(null);
      return [
        ...prev,
        ...imgs.slice(0, Math.max(0, room)).map((file) => ({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          state: "idle" as const,
        })),
      ];
    });
    if (input.current) input.current.value = "";
  }

  function remove(id: string) {
    setItems((prev) => {
      const it = prev.find((i) => i.id === id);
      if (it) URL.revokeObjectURL(it.url);
      return prev.filter((i) => i.id !== id);
    });
  }

  const setState = (id: string, state: Item["state"]) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, state } : i)));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const queue = items.filter((i) => i.state !== "done");
    if (!queue.length) return;
    setBusy(true);
    setError(null);
    let failed = 0;
    for (const it of queue) {
      setState(it.id, "sending");
      const fd = new FormData();
      fd.append("photo", await shrink(it.file));
      const res = await uploadPhoto(partyId, fd).catch(() => ({ error: "Falha no envio" }));
      if (res?.error) failed++;
      setState(it.id, res?.error ? "error" : "done");
    }
    setBusy(false);
    // tira da lista as que foram enviadas; mantém as com erro para tentar de novo
    setItems((prev) => {
      prev.filter((i) => i.state === "done").forEach((i) => URL.revokeObjectURL(i.url));
      return prev.filter((i) => i.state !== "done").map((i) => ({ ...i, state: "idle" }));
    });
    if (failed) setError(`${failed} foto(s) não foram enviadas. Toque em enviar para tentar de novo.`);
    router.refresh();
  }

  const sent = items.filter((i) => i.state === "done").length;
  const pending = items.filter((i) => i.state !== "done").length;

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <p className="font-bold">Adicionar fotos do aniversariante</p>
        <p className="text-sm text-zinc-600">A foto marcada como ⭐ capa aparece no topo do convite.</p>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!busy) add(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          drag ? "border-pink-500 bg-pink-50" : "border-pink-200 bg-pink-50/40 hover:border-pink-400 hover:bg-pink-50"
        } ${busy ? "pointer-events-none opacity-60" : ""}`}
      >
        <span className="text-3xl" aria-hidden>📷</span>
        <span className="font-semibold text-pink-600">Toque para escolher fotos</span>
        <span className="text-xs text-zinc-500">ou arraste aqui · até {MAX_FILES} por vez</span>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => add(e.target.files)}
          disabled={busy}
        />
      </label>

      {items.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-zinc-600">
              {busy ? `Enviando ${Math.min(sent + 1, items.length)} de ${items.length}...` : `${items.length} foto(s) selecionada(s)`}
            </span>
            {!busy && (
              <button type="button" onClick={() => { items.forEach((i) => URL.revokeObjectURL(i.url)); setItems([]); setError(null); }} className="text-zinc-500 hover:text-pink-600">
                Limpar
              </button>
            )}
          </div>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {items.map((it) => (
              <li key={it.id} className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt="" className="h-full w-full object-cover" />
                {it.state === "sending" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
                  </div>
                )}
                {it.state === "done" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 text-2xl">✅</div>
                )}
                {it.state === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 text-2xl">⚠️</div>
                )}
                {!busy && (
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    aria-label="Remover foto"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white hover:bg-black/80"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={busy || pending === 0} className="btn-primary w-full disabled:opacity-60">
        {busy ? "Enviando..." : pending ? `Enviar ${pending} foto${pending > 1 ? "s" : ""}` : "Escolha fotos para enviar"}
      </button>
    </form>
  );
}
