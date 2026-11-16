"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPhoto } from "../../actions";

const MAX_SIDE = 1600;

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

export default function PhotoUploadForm({ partyId }: { partyId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const files = Array.from(input.current?.files ?? []).slice(0, 20);
    if (!files.length) return;
    setBusy(true);
    setError(null);
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      setStatus(`Enviando ${i + 1} de ${files.length}...`);
      const fd = new FormData();
      fd.append("photo", await shrink(files[i]));
      const res = await uploadPhoto(partyId, fd).catch(() => ({ error: "Falha no envio" }));
      if (res?.error) failed++;
    }
    setBusy(false);
    setStatus(null);
    if (input.current) input.current.value = "";
    if (failed) setError(`${failed} foto(s) não foram enviadas. Tente novamente.`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <p className="font-bold">Adicionar fotos do aniversariante</p>
      <p className="text-sm text-zinc-600">A foto marcada como ⭐ capa aparece no topo do convite.</p>
      <input ref={input} type="file" name="photos" accept="image/*" multiple required className="block w-full text-sm" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
        {busy ? status : "Enviar fotos"}
      </button>
    </form>
  );
}
