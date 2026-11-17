import GiftsList from "@/components/GiftsList";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { track } from "@/lib/track";
import { fmtDate, fmtTime, THEMES } from "@/lib/format";
import PartyView from "@/components/PartyView";
import OpenRsvpForm from "./OpenRsvpForm";

async function load(slug: string) {
  return db.party.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { createdAt: "asc" } },
      gifts: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { title: "Festa" };
  const title = `Aniversário ${p.age ? `de ${p.age} anos ` : ""}de ${p.honoreeName} 🎉`;
  const description = `${fmtDate(p.date)} às ${fmtTime(p.date)} · ${p.venueName}. Confirme sua presença!`;
  return { title, description, openGraph: { title, description, images: (p.profileUrl ?? p.coverUrl) ? [(p.profileUrl ?? p.coverUrl)!] : [] } };
}

export default async function FestaPublica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const party = await load(slug);
  if (!party || !party.active) notFound();
  const theme = THEMES[party.theme] ?? THEMES.infantil;
  await track({ path: `/f/${slug}`, kind: "party", partyId: party.id });

  return (
    <PartyView
      party={party}
      photos={party.photos}
      greeting={
        <p className="text-lg text-zinc-600">
          {theme.emoji} Você está convidado(a) para o aniversário de
        </p>
      }
      rsvp={<OpenRsvpForm slug={slug} />}
      gifts={
        party.gifts.length > 0 ? <GiftsList gifts={party.gifts} /> : null
      }
    />
  );
}
