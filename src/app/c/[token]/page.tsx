import GiftsList from "@/components/GiftsList";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { track } from "@/lib/track";
import { fmtDate, fmtTime, firstName, greetingText, birthdayOf, THEMES } from "@/lib/format";
import PartyView from "@/components/PartyView";
import RsvpForm from "./RsvpForm";

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
  const description = `${birthdayOf(p)} · ${fmtDate(p.date)} às ${fmtTime(p.date)}`;
  return { title, description, openGraph: { title, description, images: (p.profileUrl ?? p.coverUrl) ? [(p.profileUrl ?? p.coverUrl)!] : [] } };
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
          {greetingText(party) && <p className="mt-1 text-zinc-600">{greetingText(party)}</p>}
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
        party.gifts.length > 0 ? <GiftsList gifts={party.gifts} token={token} guestId={guest.id} /> : null
      }
    />
  );
}
