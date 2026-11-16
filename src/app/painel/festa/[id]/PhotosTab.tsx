import type { Party, Photo } from "@prisma/client";
import { uploadPhotos, setCover, deletePhoto } from "../../actions";
import SubmitButton from "@/components/SubmitButton";

export default function PhotosTab({ party, photos }: { party: Party; photos: Photo[] }) {
  return (
    <div className="space-y-5">
      <form action={uploadPhotos.bind(null, party.id)} className="card space-y-3">
        <p className="font-bold">Adicionar fotos do aniversariante</p>
        <p className="text-sm text-zinc-600">Até 4MB por foto. A foto marcada como ⭐ capa aparece no topo do convite.</p>
        <input type="file" name="photos" accept="image/*" multiple required className="block w-full text-sm" />
        <SubmitButton pendingText="Enviando...">Enviar fotos</SubmitButton>
      </form>

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
