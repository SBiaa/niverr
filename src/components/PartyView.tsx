import Link from "next/link";
import type { Party, Photo } from "@prisma/client";
import { fmtDate, fmtTime, THEMES } from "@/lib/format";
import MapButton from "@/app/c/[token]/MapButton";
import Countdown from "@/app/c/[token]/Countdown";

/** Layout comum do convite pessoal (/c/[token]) e da página pública (/f/[slug]). */
export default function PartyView({
  party,
  photos,
  greeting,
  banner,
  rsvp,
  gifts,
}: {
  party: Party;
  photos: Photo[];
  greeting: React.ReactNode;
  banner?: React.ReactNode;
  rsvp: React.ReactNode;
  gifts?: React.ReactNode;
}) {
  const theme = THEMES[party.theme] ?? THEMES.infantil;
  const past = party.date.getTime() < Date.now() - 12 * 3600 * 1000;

  return (
    <main className={`${theme.bg} min-h-screen pb-16`} style={{ ["--accent" as string]: party.color }}>
      {banner}
      <div className="mx-auto max-w-lg px-4">
        <section className="pt-8 text-center">
          {greeting}

          {party.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={party.coverUrl}
              alt={party.honoreeName}
              className="mx-auto mt-6 h-48 w-48 rounded-full sm:h-56 sm:w-56 border-8 border-white object-cover shadow-xl"
            />
          )}

          <h1 className={`${theme.font} mt-5 break-words text-5xl font-bold leading-tight sm:text-6xl`} style={{ color: party.color }}>
            {party.honoreeName}
          </h1>
          {party.age != null && (
            <p className={`${theme.font} mt-2 text-2xl font-semibold text-zinc-700`}>
              {party.theme === "quinze"
                ? "✨ 15 anos ✨"
                : `${party.age} ${party.age === 1 ? "aninho" : party.theme === "infantil" ? "aninhos" : "anos"}`}
            </p>
          )}
          {party.message && <p className="mx-auto mt-5 max-w-md whitespace-pre-line text-zinc-700">{party.message}</p>}
        </section>

        {!past && <Countdown iso={party.date.toISOString()} color={party.color} />}

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

        <section className="card mt-6">
          {past ? <p className="text-center text-zinc-600">A festa já aconteceu. 🎈</p> : rsvp}
        </section>

        {photos.length > 0 && (
          <section className="mt-8">
            <h2 className={`${theme.font} mb-3 text-center text-2xl font-bold`}>📸 Fotos</h2>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((p) => (
                <a key={p.id} href={p.url} target="_blank">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover shadow-sm" />
                </a>
              ))}
            </div>
          </section>
        )}

        {gifts && (
          <section className="mt-8">
            <h2 className={`${theme.font} text-center text-2xl font-bold`}>🎁 Presentes</h2>
            {gifts}
          </section>
        )}

        <p className="mt-12 text-center text-xs text-zinc-400">
          Convite feito com <Link href="/" className="font-semibold">niverr 🎂</Link>
        </p>
      </div>
    </main>
  );
}
