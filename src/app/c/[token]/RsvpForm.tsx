"use client";
import { useState } from "react";
import { rsvp } from "./actions";
import SubmitButton from "@/components/SubmitButton";

export default function RsvpForm({
  token,
  name,
  status,
  companions,
  note,
  disabled,
}: {
  token: string;
  name: string;
  status: string;
  companions: number;
  note: string | null;
  disabled: boolean;
}) {
  const [editing, setEditing] = useState(status === "pending");
  const [choice, setChoice] = useState<"yes" | "no" | null>(status === "pending" ? null : (status as "yes" | "no"));

  if (!editing)
    return (
      <div className="text-center">
        <p className="text-4xl">{status === "yes" ? "🥳" : "💌"}</p>
        <p className="mt-2 text-lg font-bold">
          {status === "yes"
            ? `Oba, ${name}! Presença confirmada.`
            : `Que pena, ${name}! Obrigado por avisar.`}
        </p>
        {status === "yes" && companions > 0 && (
          <p className="text-zinc-600">Você + {companions} acompanhante(s)</p>
        )}
        {!disabled && (
          <button className="mt-3 text-sm font-semibold text-zinc-500 underline" onClick={() => setEditing(true)}>
            Mudar minha resposta
          </button>
        )}
      </div>
    );

  if (disabled) return <p className="text-center text-zinc-600">A festa já aconteceu. 🎈</p>;

  return (
    <form
      action={async (f) => {
        await rsvp(token, f);
        setEditing(false);
      }}
      className="space-y-4"
    >
      <p className="text-center text-xl font-bold">Você consegue comparecer?</p>
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
          <select name="companions" defaultValue={companions} className="input">
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i} value={i}>{i === 0 ? "Só eu" : `+ ${i}`}</option>
            ))}
          </select>
        </div>
      )}
      {choice && (
        <>
          <div>
            <label className="label">Deixe um recado (opcional)</label>
            <textarea name="note" rows={2} className="input" defaultValue={note ?? ""} placeholder="Parabéns! 🎂" />
          </div>
          <SubmitButton className="btn-primary w-full py-3 text-lg" pendingText="Enviando...">
            Enviar resposta
          </SubmitButton>
        </>
      )}
    </form>
  );
}
