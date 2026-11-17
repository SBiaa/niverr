import Link from "next/link";
import type { Party, Photo } from "@prisma/client";
import { fmtDate, fmtTime, THEMES } from "@/lib/format";
import MapButton from "@/app/c/[token]/MapButton";
import Countdown from "@/app/c/[token]/Countdown";
import Gallery from "@/components/Gallery";
import DesignScene from "@/components/DesignScene";
import { DESIGNS, isDark, resolvePalette } from "@/lib/designs";

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
  greeting?: React.ReactNode;
  banner?: React.ReactNode;
  rsvp: React.ReactNode;
  gifts?: React.ReactNode;
}) {
  const theme = THEMES[party.theme] ?? THEMES.infantil;
  const name = party.honoreeName.trim();
  const shown = photos.filter((p) => p.inGallery);
  const past = party.date.getTime() < Date.now() - 12 * 3600 * 1000;
  const def = DESIGNS[party.design];
  const forest = !!def?.scene; // tema com cena própria
  const pal = resolvePalette(party.design, party.palette);
  // clássico: só troca o fundo estampado do tipo de festa se o organizador escolheu outra cor
  const customBg = !forest && !!def && pal.pageBg !== def.palette.pageBg;
  const pageBg = forest ? pal[def.pageKey!] : customBg ? pal.pageBg : "";
  const onDark = !!pageBg && isDark(pageBg);
  const headTone = onDark ? "text-white" : "";
  const coverBg = !forest && !!party.coverUrl;

  return (
    <main
      className={`${pageBg ? "" : theme.bg} min-h-screen pb-16`}
      style={{ ["--accent" as string]: party.color, ...(pageBg ? { background: pageBg } : {}) }}
    >
      {banner}
      {forest && (
        <div className="relative isolate overflow-hidden">
          <DesignScene design={party.design} palette={pal} className="absolute inset-0 -z-10 h-full w-full" />
          <div className="mx-auto max-w-lg px-4 pb-56 pt-8 text-center">
            {greeting && <div className="mx-auto inline-block rounded-2xl bg-white/80 px-4 py-2 backdrop-blur">{greeting}</div>}
            {party.profileUrl && <ProfileImg party={party} className="mt-6 border-white/90" />}
            {name && (
              <h1
                className="mt-5 break-words text-5xl font-extrabold leading-tight text-white sm:text-6xl"
                style={
                  def.titleColorKey
                    ? {
                        color: pal[def.titleColorKey],
                        WebkitTextStroke: "3px #FFF8E7",
                        paintOrder: "stroke fill",
                        textShadow: "0 5px 14px rgba(59,36,24,.25)",
                      }
                    : { textShadow: `0 4px 0 ${pal[def.titleShadowKey!]}, 0 10px 28px rgba(0,0,0,.3)` }
                }
              >
                {name}
              </h1>
            )}
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
      {coverBg && (
        <div className="relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-b-[2.5rem] shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={party.coverUrl!} alt={name} className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10" style={{ background: pal.overlay, opacity: 0.4 }} />
          <div className="mx-auto w-full max-w-lg px-4 pb-10 pt-24 text-center">
            {greeting && <div className="mx-auto inline-block rounded-2xl bg-white/80 px-4 py-2 backdrop-blur">{greeting}</div>}
            {party.profileUrl && <ProfileImg party={party} className="mt-5 border-white/90" />}
            {name && (
              <h1
                className={`${theme.font} mt-4 break-words text-5xl font-bold leading-tight sm:text-6xl`}
                style={{ color: pal.titleText, textShadow: "0 3px 16px rgba(0,0,0,.45)" }}
              >
                {name}
              </h1>
            )}
            {party.age != null && (
              <p className="mt-2 inline-block rounded-full px-4 py-1 text-xl font-bold text-zinc-900" style={{ background: party.color }}>
                {party.theme === "quinze"
                  ? "✨ 15 anos ✨"
                  : `${party.age} ${party.age === 1 ? "aninho" : party.theme === "infantil" ? "aninhos" : "anos"}`}
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
        {!forest && !coverBg && (
        <section className="pt-8 text-center">
          {onDark && greeting ? <div className="mx-auto inline-block rounded-2xl bg-white/80 px-4 py-2">{greeting}</div> : greeting}

          {party.profileUrl && <ProfileImg party={party} className="mt-6 border-white" />}

          {name && (
            <h1 className={`${theme.font} mt-5 break-words text-5xl font-bold leading-tight sm:text-6xl`} style={{ color: party.color }}>
              {name}
            </h1>
          )}
          {party.age != null && (
            <p className={`${theme.font} mt-2 text-2xl font-semibold ${onDark ? "text-white" : "text-zinc-700"}`}>
              {party.theme === "quinze"
                ? "✨ 15 anos ✨"
                : `${party.age} ${party.age === 1 ? "aninho" : party.theme === "infantil" ? "aninhos" : "anos"}`}
            </p>
          )}
          {party.message && (
            <p className={`mx-auto mt-5 max-w-md whitespace-pre-line ${onDark ? "text-white" : "text-zinc-700"}`}>{party.message}</p>
          )}
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

        {shown.length > 0 && (
          <section className="mt-8">
            <h2 className={`${theme.font} ${headTone} mb-3 text-center text-2xl font-bold`}>📸 Fotos</h2>
            <div className={headTone}>
              <Gallery photos={shown} style={party.gallery} />
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

/** Foto do aniversariante: redonda (cortada) ou inteira, no tamanho escolhido pelo organizador. */
function ProfileImg({ party, className }: { party: Party; className?: string }) {
  const whole = party.profileFit === "contain";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={party.profileUrl!}
      alt={party.honoreeName}
      className={`mx-auto border-8 shadow-xl ${whole ? "h-auto rounded-3xl" : "rounded-full object-cover"} ${className ?? ""}`}
      style={{ width: party.profileSize, maxWidth: "100%", ...(whole ? {} : { aspectRatio: "1" }) }}
    />
  );
}
