import type { Party, Photo } from "@prisma/client";
import { setCover, deletePhoto, setCaption } from "../../actions";
import PhotoUploadForm from "./PhotoUploadForm";

export default function PhotosTab({ party, photos }: { party: Party; photos: Photo[] }) {
  return (
    <div className="space-y-5">
      <PhotoUploadForm partyId={party.id} />

      {photos.length === 0 ? (
        <p className="text-center text-zinc-500">Nenhuma foto ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((p) => {
            const isCover = party.coverUrl === p.url;
            return (
              <div key={p.id} className="overflow-hidden rounded-xl border border-zinc-100 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="aspect-square w-full object-cover" />
                <form action={setCaption.bind(null, party.id, p.id)} className="flex gap-1 px-2 pt-2">
                  <input
                    name="caption"
                    defaultValue={p.caption ?? ""}
                    maxLength={80}
                    placeholder="Legenda"
                    aria-label="Legenda da foto"
                    className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-sm"
                  />
                  <button className="rounded-lg bg-zinc-100 px-2 text-sm font-semibold text-zinc-700" title="Salvar legenda">
                    OK
                  </button>
                </form>
                <div className="flex items-center justify-between px-1 text-sm">
                  <form action={setCover.bind(null, party.id, isCover ? null : p.url)}>
                    <button className={`px-2 py-2 ${isCover ? "font-bold text-amber-600" : "text-zinc-600"}`}>
                      {isCover ? "⭐ Capa" : "☆ Capa"}
                    </button>
                  </form>
                  <form action={deletePhoto.bind(null, party.id, p.id)}>
                    <button className="px-2 py-2 text-red-600">Excluir</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
