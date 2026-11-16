import type { Photo } from "@prisma/client";

const TILT = [-3, 2, -1.5, 3, -2, 1.5];

/** Galeria de fotos do convite, no estilo escolhido pelo organizador (com legenda, se houver). */
export default function Gallery({ photos, style }: { photos: Photo[]; style: string }) {
  const link = (p: Photo, children: React.ReactNode, className = "", css?: React.CSSProperties) => (
    <a key={p.id} href={p.url} target="_blank" className={className} style={css}>
      {children}
    </a>
  );
  // eslint-disable-next-line @next/next/no-img-element
  const img = (p: Photo, cls: string) => <img src={p.url} alt={p.caption ?? ""} loading="lazy" className={cls} />;
  const cap = (p: Photo, cls: string) => (p.caption ? <span className={`block ${cls}`}>{p.caption}</span> : null);

  if (style === "polaroid")
    return (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 px-2">
        {photos.map((p, i) =>
          link(
            p,
            <>
              {img(p, "aspect-[4/5] w-full rounded-sm object-cover")}
              {cap(p, "mt-2 text-center text-sm font-semibold leading-tight text-zinc-700")}
            </>,
            `block w-[46%] rounded-md bg-white p-2 ${p.caption ? "pb-3" : "pb-8"} shadow-lg transition hover:z-10 hover:scale-105`,
            { transform: `rotate(${TILT[i % TILT.length]}deg)` },
          ),
        )}
      </div>
    );

  const below = "mt-1 px-1 text-center text-xs font-semibold opacity-80";

  if (style === "mosaico")
    return (
      <div className="columns-2 gap-2">
        {photos.map((p) =>
          link(
            p,
            <>
              {img(p, "w-full rounded-xl object-cover shadow-sm")}
              {cap(p, below)}
            </>,
            "mb-2 block break-inside-avoid",
          ),
        )}
      </div>
    );

  if (style === "carrossel")
    return (
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3">
        {photos.map((p) =>
          link(
            p,
            <>
              {img(p, "h-72 w-full rounded-2xl object-cover shadow-md")}
              {cap(p, below)}
            </>,
            "block w-[78%] shrink-0 snap-center",
          ),
        )}
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((p) =>
        link(
          p,
          <>
            {img(p, "aspect-square w-full rounded-xl object-cover shadow-sm")}
            {cap(p, below)}
          </>,
        ),
      )}
    </div>
  );
}
