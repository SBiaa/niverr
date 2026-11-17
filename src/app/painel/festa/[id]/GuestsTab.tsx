import type { Guest, Party } from "@prisma/client";
import { addGuests } from "../../actions";
import SubmitButton from "@/components/SubmitButton";
import GuestRow from "./GuestRow";
import { buildWaMessage } from "@/lib/waMessage";
import WaTemplateEditor from "./WaTemplateEditor";

export default function GuestsTab({ party, guests, base }: { party: Party; guests: Guest[]; base: string }) {
  const yes = guests.filter((g) => g.status === "yes");
  const no = guests.filter((g) => g.status === "no");
  const pending = guests.filter((g) => g.status === "pending");
  const people = yes.reduce((s, g) => s + 1 + g.companions, 0);
  const opened = guests.filter((g) => g.openedAt).length;

  const messageFor = (g: Guest) => buildWaMessage(party, "guest", g.name, `${base}/c/${g.token}`);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["Convidados", guests.length, "text-zinc-900"],
          ["Abriram o link", opened, "text-sky-600"],
          ["Vão", yes.length, "text-emerald-600"],
          ["Não vão", no.length, "text-red-500"],
          ["Total de pessoas", people, "text-pink-600"],
        ].map(([l, v, c], i) => (
          <div key={l as string} className={`card p-4 ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
            <p className="text-xs font-semibold uppercase text-zinc-500">{l}</p>
            <p className={`text-2xl font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>
      {pending.length > 0 && (
        <p className="text-sm text-zinc-600">⏳ {pending.length} ainda não responderam.</p>
      )}

      <details className="card" open={guests.length === 0}>
        <summary className="cursor-pointer font-bold">+ Adicionar convidados</summary>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <form action={addGuests.bind(null, party.id)} className="space-y-3">
            <p className="text-sm font-semibold text-zinc-600">Um por vez</p>
            <input name="name" className="input" placeholder="Nome (ex: Maria Silva)" required />
            <input name="phone" className="input" placeholder="WhatsApp (ex: 11 98888-7777)" inputMode="tel" />
            <SubmitButton pendingText="Adicionando...">Adicionar</SubmitButton>
          </form>
          <form action={addGuests.bind(null, party.id)} className="space-y-3">
            <p className="text-sm font-semibold text-zinc-600">Vários de uma vez (um por linha)</p>
            <textarea
              name="bulk"
              rows={5}
              className="input font-mono text-sm"
              placeholder={"Maria Silva 11988887777\nJoão Pedro, 21 99999-1111\nFamília Souza"}
              required
            />
            <SubmitButton pendingText="Adicionando...">Adicionar lista</SubmitButton>
          </form>
        </div>
      </details>

      <WaTemplateEditor
        kind="guest"
        partyId={party.id}
        initial={party.waTemplate}
        preview={{ honoreeName: party.honoreeName, age: party.age, date: party.date.toISOString(), venueName: party.venueName }}
        base={base}
      />

      {guests.length > 0 && (
        <div className="flex justify-end">
          <a href={`/api/export/${party.id}`} className="btn-ghost text-sm">⬇️ Exportar lista (Excel/CSV)</a>
        </div>
      )}

      <ul className="space-y-2">
        {guests.map((g) => (
          <GuestRow
            key={g.id}
            partyId={party.id}
            guest={g}
            link={`${base}/c/${g.token}`}
            message={messageFor(g)}
          />
        ))}
      </ul>
    </div>
  );
}
