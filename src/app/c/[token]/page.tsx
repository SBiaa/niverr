import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { track } from "@/lib/track";
import { fmtDate, fmtTime, firstName, THEMES } from "@/lib/format";
import PartyView from "@/components/PartyView";
import RsvpForm from "./RsvpForm";
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
  searchParams: Promise<{ preview?: string; ok?: string }>;
}) {
  const { token } = await params;
  const { preview, ok } = await searchParams;
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

  return (
    <PartyView
      party={party}
      photos={party.photos}
      banner={
        isPreview ? (
          <div className="bg-amber-100 py-2 text-center text-sm text-amber-800">
            Pré-visualização do organizador — esta visita não conta como abertura.
          </div>
        ) : ok === "1" ? (
          <div className="bg-emerald-100 px-4 py-3 text-center text-sm text-emerald-800">
            ✅ Resposta registrada! Este é o seu convite pessoal — salve este link para mudar sua resposta depois.
          </div>
        ) : null
      }
      greeting={
        <>
          <p className="text-lg text-zinc-600">
            Olá, <b style={{ color: party.color }}>{firstName(guest.name)}</b>! {theme.emoji}
          </p>
          <p className="mt-1 text-zinc-600">Você está convidado(a) para o aniversário de</p>
        </>
      }
      rsvp={
        <RsvpForm
          token={token}
          name={firstName(guest.name)}
          status={guest.status}
          companions={guest.companions}
          note={guest.note}
          disabled={false}
        />
      }
      gifts={
        party.gifts.length > 0 ? (
          <>
            <p className="mb-3 text-center text-sm text-zinc-600">Escolha um presente pra ninguém repetir (opcional).</p>
            <ul className="space-y-2">
              {party.gifts.map((g) => {
                const mine = g.guestId === guest.id;
                const taken = !!g.guestId && !mine;
                return (
                  <li key={g.id} className={`card flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 ${taken ? "opacity-50" : ""}`}>
                    <div className="min-w-0 sm:flex-1">
                      <p className={`font-semibold ${taken ? "line-through" : ""}`}>{g.name}</p>
                      {g.link && !taken && (
                        <a href={g.link} target="_blank" className="text-xs text-sky-600">Ver na loja ↗</a>
                      )}
                    </div>
                    {taken ? (
                      <span className="text-xs text-zinc-500">Já escolhido</span>
                    ) : mine ? (
                      <form action={unpickGift.bind(null, token, g.id)}>
                        <SubmitButton className="btn w-full whitespace-nowrap bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:w-auto" pendingText="...">
                          ✔ Eu vou dar · desfazer
                        </SubmitButton>
                      </form>
                    ) : (
                      <form action={pickGift.bind(null, token, g.id)}>
                        <SubmitButton className="btn-primary w-full whitespace-nowrap px-3 py-2 text-sm sm:w-auto" pendingText="...">Eu vou dar</SubmitButton>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        ) : null
      }
    />
  );
}
