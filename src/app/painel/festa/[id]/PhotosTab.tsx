import type { Party, Photo } from "@prisma/client";
import { setCover, deletePhoto } from "../../actions";
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
