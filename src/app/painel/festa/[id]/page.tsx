import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { baseUrl } from "@/lib/url";
import { fmtDate, fmtTime, THEMES } from "@/lib/format";
import GuestsTab from "./GuestsTab";
import PhotosTab from "./PhotosTab";
import GiftsTab from "./GiftsTab";
import PartyForm from "@/components/PartyForm";
import SubmitButton from "@/components/SubmitButton";
import { updateParty, deleteParty } from "../../actions";
import { ensureSlug } from "@/lib/slug";
import PublicLink from "./PublicLink";

const TABS = [
  ["convidados", "👥 Convidados"],
  ["detalhes", "📝 Detalhes"],
  ["fotos", "📸 Fotos"],
  ["presentes", "🎁 Presentes"],
] as const;

export default async function FestaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const { id } = await params;
  const { aba = "convidados" } = await searchParams;
  const user = await requireUser();
  const party = await db.party.findFirst({
    where: { id, ownerId: user.id },
    include: {
      guests: { orderBy: [{ createdAt: "asc" }, { name: "asc" }] },
      photos: { orderBy: { createdAt: "asc" } },
      gifts: { orderBy: { createdAt: "asc" }, include: { guest: { select: { name: true } } } },
    },
  });
  if (!party) notFound();
  const base = await baseUrl();
  const slug = await ensureSlug(party);

  return (
    <div>
      <Link href="/painel" className="text-sm text-zinc-500">← Minhas festas</Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {THEMES[party.theme]?.emoji} {party.honoreeName} {party.age ? `· ${party.age} anos` : ""}
          </h1>
          <p className="first-letter:uppercase text-zinc-600">
            {fmtDate(party.date)} às {fmtTime(party.date)} · {party.venueName}
          </p>
        </div>
        {party.guests[0] && (
          <a href={`/c/${party.guests[0].token}?preview=1`} target="_blank" className="btn-ghost text-sm">
            👁️ Ver como o convidado vê
          </a>
        )}
      </div>

      <PublicLink url={`${base}/f/${slug}`} honoree={party.honoreeName} />

      <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-zinc-200">
        {TABS.map(([k, label]) => (
          <Link
            key={k}
            href={`?aba=${k}`}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold ${
              aba === k ? "border-pink-500 text-pink-600" : "border-transparent text-zinc-500"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-5">
        {aba === "convidados" && <GuestsTab party={party} guests={party.guests} base={base} />}
        {aba === "detalhes" && (
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="card">
              <PartyForm action={updateParty.bind(null, party.id)} party={party} submitLabel="Salvar alterações" />
            </div>
            <form action={deleteParty.bind(null, party.id)} className="card border-red-100">
              <p className="font-semibold text-red-700">Excluir festa</p>
              <p className="text-sm text-zinc-600">Apaga a festa, os convidados, fotos e presentes. Não dá pra desfazer.</p>
              <SubmitButton className="btn mt-3 bg-red-600 text-white" pendingText="Excluindo...">Excluir festa</SubmitButton>
            </form>
          </div>
        )}
        {aba === "fotos" && <PhotosTab party={party} photos={party.photos} />}
        {aba === "presentes" && <GiftsTab partyId={party.id} gifts={party.gifts} />}
      </div>
    </div>
  );
}
