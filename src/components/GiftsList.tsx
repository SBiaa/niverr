import type { Gift } from "@prisma/client";
import SubmitButton from "./SubmitButton";
import { pickGift, unpickGift } from "@/app/c/[token]/actions";

/**
 * Lista de presentes do convite.
 * - "info": dicas (tamanhos, gostos) — só informação, sem reservar.
 * - "item": dá pra escolher; com `token` mostra os botões, sem token só o status.
 */
export default function GiftsList({ gifts, token, guestId }: { gifts: Gift[]; token?: string; guestId?: string }) {
  const infos = gifts.filter((g) => g.kind === "info");
  const items = gifts.filter((g) => g.kind !== "info");

  return (
    <div className="mt-3 space-y-6">
      {infos.length > 0 && (
        <div className="card space-y-3">
          <p className="text-center text-sm font-semibold text-zinc-600">💡 Dicas para presentear</p>
          <ul className="space-y-2">
            {infos.map((g) => (
              <li key={g.id} className="rounded-xl bg-zinc-50 px-3 py-2">
                <p className="font-semibold">{g.name}</p>
                {g.link && (
                  <a href={g.link} target="_blank" className="text-xs text-sky-600">Ver sugestão ↗</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length > 0 && (
        <div>
          <p className="mb-3 text-center text-sm text-zinc-600">
            {token
              ? "Escolha um presente pra ninguém repetir (opcional)."
              : "Depois de confirmar presença, você pode escolher um presente pra ninguém repetir."}
          </p>
          <ul className="space-y-2">
            {items.map((g) => {
              const mine = !!guestId && g.guestId === guestId;
              const taken = !!g.guestId && !mine;
              return (
                <li key={g.id} className={`card flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 ${taken ? "opacity-50" : ""}`}>
                  <div className="min-w-0 sm:flex-1">
                    <p className={`font-semibold ${taken ? "line-through" : ""}`}>{g.name}</p>
                    {g.link && !taken && (
                      <a href={g.link} target="_blank" className="text-xs text-sky-600">Ver na loja ↗</a>
                    )}
                  </div>
                  {taken || !token ? (
                    <span className="shrink-0 text-xs text-zinc-500">{taken ? "Já escolhido" : "Disponível"}</span>
                  ) : mine ? (
                    <form action={unpickGift.bind(null, token, g.id)}>
                      <SubmitButton className="btn w-full whitespace-nowrap bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:w-auto" pendingText="...">
                        ✔ Eu vou dar · desfazer
                      </SubmitButton>
                    </form>
                  ) : (
                    <form action={pickGift.bind(null, token, g.id)}>
                      <SubmitButton className="btn-primary w-full whitespace-nowrap px-3 py-2 text-sm sm:w-auto" pendingText="...">
                        Eu vou dar
                      </SubmitButton>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
