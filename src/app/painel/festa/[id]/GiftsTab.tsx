import type { Gift } from "@prisma/client";
import { addGift, deleteGift, releaseGift } from "../../actions";
import SubmitButton from "@/components/SubmitButton";
import GiftEdit from "./GiftEdit";

type G = Gift & { guest: { name: string } | null };

export function KindPicker({ value = "item" }: { value?: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {[
        ["item", "🎁 Item da lista", "Alguém escolhe e ele sai da lista"],
        ["info", "💡 Sugestão / informação", "Só uma dica (ex: tamanho de roupa)"],
      ].map(([k, l, d]) => (
        <label key={k} className="cursor-pointer">
          <input type="radio" name="kind" value={k} defaultChecked={value === k} className="peer sr-only" />
          <span className="block h-full rounded-xl border-2 border-zinc-200 bg-white p-3 peer-checked:border-pink-500 peer-checked:bg-pink-50">
            <b className="block">{l}</b>
            <span className="text-xs text-zinc-500">{d}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

export default function GiftsTab({ partyId, gifts }: { partyId: string; gifts: G[] }) {
  const infos = gifts.filter((g) => g.kind === "info");
  const items = gifts.filter((g) => g.kind !== "info");

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <form action={addGift.bind(null, partyId)} className="card space-y-3">
        <p className="font-bold">Adicionar presente</p>
        <KindPicker />
        <input name="name" className="input" placeholder="Ex: Boneca da Masha · ou · Roupa: tamanho 4" required />
        <input name="link" type="url" className="input" placeholder="Link da loja (opcional)" />
        <SubmitButton pendingText="Adicionando...">Adicionar</SubmitButton>
      </form>

      {gifts.length === 0 && (
        <p className="text-center text-zinc-500">Nenhum presente na lista. Se ficar vazia, a lista não aparece no convite.</p>
      )}

      {infos.length > 0 && (
        <section>
          <h3 className="mb-2 font-bold">💡 Sugestões e informações</h3>
          <ul className="space-y-2">
            {infos.map((g) => (
              <li key={g.id} className="card flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
                <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
                  <p className="font-semibold">{g.name}</p>
                  {g.link && <a href={g.link} target="_blank" className="block truncate text-xs text-sky-600">{g.link}</a>}
                </div>
                <GiftEdit partyId={partyId} gift={g} />
                <form action={deleteGift.bind(null, partyId, g.id)}>
                  <button className="px-2 py-2 text-sm text-red-600">Excluir</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {items.length > 0 && (
        <section>
          <h3 className="mb-2 font-bold">🎁 Itens da lista</h3>
          <ul className="space-y-2">
            {items.map((g) => (
              <li key={g.id} className="card flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
                <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
                  <p className="font-semibold">{g.name}</p>
                  {g.link && <a href={g.link} target="_blank" className="block truncate text-xs text-sky-600">{g.link}</a>}
                </div>
                {g.guest ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{g.guest.name} vai dar</span>
                ) : (
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">Disponível</span>
                )}
                {g.guest && (
                  <form action={releaseGift.bind(null, partyId, g.id)}>
                    <button className="px-2 py-2 text-sm text-zinc-500">Liberar</button>
                  </form>
                )}
                <div className="ml-auto flex sm:ml-0">
                  <GiftEdit partyId={partyId} gift={g} />
                  <form action={deleteGift.bind(null, partyId, g.id)}>
                    <button className="px-2 py-2 text-sm text-red-600">Excluir</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
