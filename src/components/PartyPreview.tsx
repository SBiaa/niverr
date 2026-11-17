"use client";
import { useEffect, useState } from "react";
import type { Party, Photo } from "@prisma/client";
import PartyView from "./PartyView";
import { greetingText, parseLocal, THEMES } from "@/lib/format";
import { paletteFromForm, DESIGNS } from "@/lib/designs";

/** Monta uma festa "rascunho" a partir do que está digitado no formulário. */
function draftFrom(form: FormData, base: Party | undefined): Party {
  const s = (k: string) => String(form.get(k) ?? "");
  const design = DESIGNS[s("design")] ? s("design") : "padrao";
  const date = parseLocal(s("date"));
  const age = parseInt(s("age"), 10);
  return {
    ...(base ?? ({} as Party)),
    honoreeName: s("honoreeName").trim(),
    age: Number.isFinite(age) ? age : null,
    theme: s("theme") || "infantil",
    color: s("color") || "#ec4899",
    design,
    palette: paletteFromForm(design, form),
    greeting: s("greeting").trim() || null,
    showGreeting: form.get("showGreeting") === "on",
    gallery: s("gallery") || "grade",
    coverUrl: s("coverUrl") || (form.has("coverUrl") ? null : base?.coverUrl ?? null),
    profileUrl: s("profileUrl") || (form.has("profileUrl") ? null : base?.profileUrl ?? null),
    profileSize: parseInt(s("profileSize"), 10) || 176,
    profileFit: form.get("profileFit") === "contain" ? "contain" : "cover",
    date: isNaN(date.getTime()) ? new Date(Date.now() + 14 * 86400000) : date,
    endTime: s("endTime") || null,
    venueName: s("venueName") || "Local da festa",
    address: s("address") || "Endereço",
    message: s("message").trim() || null,
  };
}

/** Prévia ao vivo do convite: acompanha o formulário enquanto o organizador edita. */
export default function PartyPreview({ formId, party, photos }: { formId: string; party?: Party; photos: Photo[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Party | null>(null);

  useEffect(() => {
    let last = "";
    const tick = () => {
      const el = document.getElementById(formId) as HTMLFormElement | null;
      if (!el) return;
      const fd = new FormData(el);
      const key = JSON.stringify([...fd.entries()]);
      if (key === last) return;
      last = key;
      setDraft(draftFrom(fd, party));
    };
    tick();
    const t = setInterval(tick, 300);
    return () => clearInterval(t);
  }, [formId, party]);

  return (
    <>
      {/* celular/tablet: botão flutuante abre a prévia em tela cheia */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-xl lg:hidden"
      >
        👁️ Prévia
      </button>
      <aside
        className={`${open ? "fixed inset-0 z-40 flex flex-col bg-zinc-900/80 p-3 backdrop-blur" : "hidden"} lg:sticky lg:top-20 lg:block lg:bg-transparent lg:p-0`}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className={`text-xs font-semibold ${open ? "text-white" : ""} lg:text-zinc-500`}>
            👁️ Prévia ao vivo
          </p>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-white px-3 py-1 text-sm font-semibold lg:hidden">
            Fechar
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-3xl border-4 border-zinc-800 bg-white shadow-xl lg:h-[calc(100vh-8rem)] lg:flex-none">
          {draft && (
            <PartyView
              party={draft}
              photos={photos}
              greeting={
                greetingText(draft) && (
                  <p className="text-lg text-zinc-600">
                    {(THEMES[draft.theme] ?? THEMES.infantil).emoji} {greetingText(draft)}
                  </p>
                )
              }
              rsvp={<p className="text-center text-sm text-zinc-500">(Aqui aparece a confirmação de presença)</p>}
            />
          )}
        </div>
      </aside>
    </>
  );
}
