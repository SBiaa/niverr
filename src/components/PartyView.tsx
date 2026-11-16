import Link from "next/link";
import type { Party, Photo } from "@prisma/client";
import { fmtDate, fmtTime, THEMES } from "@/lib/format";
import MapButton from "@/app/c/[token]/MapButton";
import Countdown from "@/app/c/[token]/Countdown";
import ForestScene from "@/components/ForestScene";
import { isDark, resolvePalette } from "@/lib/designs";

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
  const forest = party.design === "floresta";
  const pal = resolvePalette(party.design, party.palette);
  const onDark = forest && isDark(pal.ground);
  const headTone = onDark ? "text-white" : "";

  return (
    <main
      className={`${forest ? "" : theme.bg} min-h-screen pb-16`}
      style={{ ["--accent" as string]: party.color, ...(forest ? { background: pal.ground } : {}) }}
    >
      {banner}
      {forest && (
        <div className="relative isolate overflow-hidden">
          <ForestScene palette={pal} className="absolute inset-0 -z-10 h-full w-full" />
          <div className="mx-auto max-w-lg px-4 pb-56 pt-8 text-center">
            <div className="mx-auto inline-block rounded-2xl bg-white/80 px-4 py-2 backdrop-blur">{greeting}</div>
            {party.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={party.coverUrl}
                alt={party.honoreeName}
                className="mx-auto mt-6 h-44 w-44 rounded-full border-8 border-white/90 object-cover shadow-xl sm:h-52 sm:w-52"
              />
            )}
            <h1
              className="mt-5 break-words text-5xl font-extrabold leading-tight text-white sm:text-6xl"
              style={{ textShadow: `0 4px 0 ${pal.treesMid}, 0 10px 28px rgba(0,0,0,.3)` }}
            >
              {party.honoreeName}
            </h1>
            {party.age != null && (
              <p
                className="mt-2 inline-block rounded-full px-4 py-1 text-xl font-bold text-zinc-900"
                style={{ background: party.color }}
              >
                {`${party.age} ${party.age === 1 ? "aninho" : "anos"}`}
              </p>
            )}
            {party.message && (
              <p className="mx-auto mt-5 max-w-md whitespace-pre-line rounded-2xl bg-black/35 px-4 py-3 text-white">
                {party.message}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-lg px-4">
        {!forest && (
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
        )}

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
            <h2 className={`${theme.font} ${headTone} mb-3 text-center text-2xl font-bold`}>📸 Fotos</h2>
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
            <h2 className={`${theme.font} ${headTone} text-center text-2xl font-bold`}>🎁 Presentes</h2>
            {gifts}
          </section>
        )}

        <p className={`mt-12 text-center text-xs ${onDark ? "text-white/60" : "text-zinc-400"}`}>
          Convite feito com <Link href="/" className="font-semibold">niverr 🎂</Link>
        </p>
      </div>
    </main>
  );
}
