"use client";
import { useState } from "react";
import type { Gift } from "@prisma/client";
import { updateGift } from "../../actions";

export default function GiftEdit({ partyId, gift }: { partyId: string; gift: Gift }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="px-2 py-2 text-sm text-zinc-600">
        Editar
      </button>
    );
  return (
    <form
      action={async (f) => {
        await updateGift(partyId, gift.id, f);
        setOpen(false);
      }}
      className="basis-full space-y-2 border-t border-zinc-100 pt-3"
    >
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          ["item", "🎁 Item da lista"],
          ["info", "💡 Sugestão / informação"],
        ].map(([k, l]) => (
          <label key={k} className="cursor-pointer">
            <input type="radio" name="kind" value={k} defaultChecked={(gift.kind || "item") === k} className="peer sr-only" />
            <span className="block rounded-xl border-2 border-zinc-200 bg-white p-2 text-center font-semibold peer-checked:border-pink-500 peer-checked:bg-pink-50">
              {l}
            </span>
          </label>
        ))}
      </div>
      <input name="name" defaultValue={gift.name} className="input" required />
      <input name="link" type="url" defaultValue={gift.link ?? ""} className="input" placeholder="Link da loja (opcional)" />
      <div className="flex gap-2">
        <button className="btn-primary">Salvar</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
      </div>
    </form>
  );
}
