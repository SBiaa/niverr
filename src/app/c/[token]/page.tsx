import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { track } from "@/lib/track";
import { fmtDate, fmtTime, firstName, THEMES } from "@/lib/format";
import MapButton from "./MapButton";
import RsvpForm from "./RsvpForm";
import Countdown from "./Countdown";
import { pickGift, unpickGift } from "./actions";
import SubmitButton from "@/components/SubmitButton";

async function load(token: string) {
  return db.guest.findUnique({
    where: { token },
    include: {
      party: {
        include: {
          photos: { orderBy: { createdAt: "asc" } },
          gifts: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const g = await load((await params).token);
  if (!g) return { title: "Convite" };
  const p = g.party;
  const title = `${firstName(g.name)}, você está convidado(a)! 🎉`;
  const description = `Aniversário ${p.age ? `de ${p.age} anos ` : ""}de ${p.honoreeName} · ${fmtDate(p.date)} às ${fmtTime(p.date)}`;
  return { title, description, openGraph: { title, description, images: p.coverUrl ? [p.coverUrl] : [] } };
}

export default async function Convite({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { token } = await params;
  const { preview } = await searchParams;
  const guest = await load(token);
  if (!guest || !guest.party.active) notFound();
  const party = guest.party;
  const theme = THEMES[party.theme] ?? THEMES.infantil;
  const isPreview = preview === "1";

  if (!isPreview) {
    if (!guest.openedAt) await db.guest.update({ where: { id: guest.id }, data: { openedAt: new Date() } });
    const recent = await db.accessLog.findFirst({
      where: { guestId: guest.id, kind: "invite", createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } },
      select: { id: true },
    });
    if (!recent) await track({ path: `/c/${token}`, kind: "invite", guestId: guest.id, partyId: party.id });
  }

  const past = party.date.getTime() < Date.now() - 12 * 3600 * 1000;

  return (
    <main className={`${theme.bg} min-h-screen pb-16`} style={{ ["--accent" as string]: party.color }}>
      {isPreview && (
        <div className="bg-amber-100 py-2 text-center text-sm text-amber-800">
          Pré-visualização do organizador — esta visita não conta como abertura.
        </div>
      )}
      <div className="mx-auto max-w-lg px-4">
        {/* topo */}
        <section className="pt-8 text-center">
          <p className="text-lg text-zinc-600">
            Olá, <b style={{ color: party.color }}>{firstName(guest.name)}</b>! {theme.emoji}
          </p>
          <p className="mt-1 text-zinc-600">Você está convidado(a) para o aniversário de</p>

          {party.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={party.coverUrl}
              alt={party.honoreeName}
              className="mx-auto mt-6 h-56 w-56 rounded-full border-8 border-white object-cover shadow-xl"
            />
          )}

          <h1 className={`${theme.font} mt-5 text-5xl font-bold leading-tight sm:text-6xl`} style={{ color: party.color }}>
            {party.honoreeName}
          </h1>
          {party.age != null && (
            <p className={`${theme.font} mt-2 text-2xl font-semibold text-zinc-700`}>
              {party.theme === "quinze" ? "✨ 15 anos ✨" : `${party.age} ${party.age === 1 ? "aninho" : party.theme === "infantil" ? "aninhos" : "anos"}`}
            </p>
          )}
          {party.message && <p className="mx-auto mt-5 max-w-md whitespace-pre-line text-zinc-700">{party.message}</p>}
        </section>

        {!past && <Countdown iso={party.date.toISOString()} color={party.color} />}

        {/* quando e onde */}
        <section className="card mt-6 space-y-4">
          <div className="flex gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-bold first-letter:uppercase">{fmtDate(party.date)}</p>
              <p className="text-zinc-600">
                a partir das {fmtTime(party.date)}
                {party.endTime ? ` até ${party.endTime}` : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">📍</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{party.venueName}</p>
              <p className="text-zinc-600">{party.address}</p>
              <MapButton address={`${party.venueName}, ${party.address}`} />
            </div>
          </div>
        </section>

        {/* RSVP */}
        <section className="card mt-6">
          <RsvpForm
            token={token}
            name={firstName(guest.name)}
            status={guest.status}
            companions={guest.companions}
            note={guest.note}
            disabled={past}
          />
        </section>

        {/* fotos */}
        {party.photos.length > 0 && (
          <section className="mt-8">
            <h2 className={`${theme.font} mb-3 text-center text-2xl font-bold`}>📸 Fotos</h2>
            <div className="grid grid-cols-2 gap-2">
              {party.photos.map((p) => (
                <a key={p.id} href={p.url} target="_blank">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover shadow-sm" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* presentes */}
        {party.gifts.length > 0 && (
          <section className="mt-8">
            <h2 className={`${theme.font} text-center text-2xl font-bold`}>🎁 Lista de presentes</h2>
            <p className="mb-3 text-center text-sm text-zinc-600">Escolha um presente pra ninguém repetir (opcional).</p>
            <ul className="space-y-2">
              {party.gifts.map((g) => {
                const mine = g.guestId === guest.id;
                const taken = !!g.guestId && !mine;
                return (
                  <li key={g.id} className={`card flex items-center gap-3 p-3 ${taken ? "opacity-50" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold ${taken ? "line-through" : ""}`}>{g.name}</p>
                      {g.link && !taken && (
                        <a href={g.link} target="_blank" className="text-xs text-sky-600">Ver na loja ↗</a>
                      )}
                    </div>
                    {taken ? (
                      <span className="text-xs text-zinc-500">Já escolhido</span>
                    ) : mine ? (
                      <form action={unpickGift.bind(null, token, g.id)}>
                        <SubmitButton className="btn bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700" pendingText="...">
                          ✔ Eu vou dar · desfazer
                        </SubmitButton>
                      </form>
                    ) : (
                      <form action={pickGift.bind(null, token, g.id)}>
                        <SubmitButton className="btn-primary px-3 py-1.5 text-sm" pendingText="...">Eu vou dar</SubmitButton>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="mt-12 text-center text-xs text-zinc-400">
          Convite feito com <Link href="/" className="font-semibold">niverr 🎂</Link>
        </p>
      </div>
    </main>
  );
}
