import type { Gift } from "@prisma/client";
import { addGift, deleteGift, releaseGift } from "../../actions";
import SubmitButton from "@/components/SubmitButton";

export default function GiftsTab({
  partyId,
  gifts,
}: {
  partyId: string;
  gifts: (Gift & { guest: { name: string } | null })[];
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <form action={addGift.bind(null, partyId)} className="card space-y-3">
        <p className="font-bold">Adicionar presente</p>
        <input name="name" className="input" placeholder="Ex: Boneca, Lego, Vale-presente..." required />
        <input name="link" type="url" className="input" placeholder="Link da loja (opcional)" />
        <SubmitButton pendingText="Adicionando...">Adicionar</SubmitButton>
      </form>

      {gifts.length === 0 ? (
        <p className="text-center text-zinc-500">Nenhum presente na lista. Se ficar vazia, a lista não aparece no convite.</p>
      ) : (
        <ul className="space-y-2">
          {gifts.map((g) => (
            <li key={g.id} className="card flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
              <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
                <p className="font-semibold">🎁 {g.name}</p>
                {g.link && (
                  <a href={g.link} target="_blank" className="block truncate text-xs text-sky-600">{g.link}</a>
                )}
              </div>
              {g.guest ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {g.guest.name} vai dar
                </span>
              ) : (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">Disponível</span>
              )}
              {g.guest && (
                <form action={releaseGift.bind(null, partyId, g.id)}>
                  <button className="px-2 py-2 text-sm text-zinc-500">Liberar</button>
                </form>
              )}
              <form action={deleteGift.bind(null, partyId, g.id)} className="ml-auto sm:ml-0">
                <button className="px-2 py-2 text-sm text-red-600">Excluir</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
