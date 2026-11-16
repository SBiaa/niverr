"use client";
import { useActionState, useState } from "react";
import { openRsvp } from "./actions";

export default function OpenRsvpForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(openRsvp.bind(null, slug), undefined);
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);

  return (
    <form action={action} className="space-y-4">
      <p className="text-center text-xl font-bold">Confirme sua presença</p>
      <div>
        <label className="label">Seu nome</label>
        <input name="name" key={`n${state?.name}`} defaultValue={state?.name} className="input" required placeholder="Nome e sobrenome" />
      </div>
      <div>
        <label className="label">Seu WhatsApp</label>
        <input name="phone" key={`p${state?.phone}`} defaultValue={state?.phone} className="input" required inputMode="tel" placeholder="(11) 98888-7777" />
      </div>

      <input type="hidden" name="status" value={choice ?? ""} />
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setChoice("yes")}
          className={`rounded-2xl border-2 p-3 text-base font-bold transition sm:p-4 sm:text-lg ${
            choice === "yes" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white"
          }`}
        >
          🎉<br />Sim, eu vou!
        </button>
        <button
          type="button"
          onClick={() => setChoice("no")}
          className={`rounded-2xl border-2 p-3 text-base font-bold transition sm:p-4 sm:text-lg ${
            choice === "no" ? "border-red-400 bg-red-50 text-red-600" : "border-zinc-200 bg-white"
          }`}
        >
          😢<br />Não vou poder
        </button>
      </div>

      {choice === "yes" && (
        <div>
          <label className="label">Vai levar acompanhantes? Quantos?</label>
          <select name="companions" defaultValue={0} className="input">
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i} value={i}>{i === 0 ? "Só eu" : `+ ${i}`}</option>
            ))}
          </select>
        </div>
      )}
      {choice && (
        <div>
          <label className="label">Deixe um recado (opcional)</label>
          <textarea name="note" rows={2} className="input" placeholder="Parabéns! 🎂" />
        </div>
      )}

      {state?.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full py-3 text-lg" disabled={pending || !choice}>
        {pending ? "Enviando..." : "Enviar resposta"}
      </button>
      <p className="text-center text-xs text-zinc-500">Seu telefone só fica visível para quem organiza a festa.</p>
    </form>
  );
}
