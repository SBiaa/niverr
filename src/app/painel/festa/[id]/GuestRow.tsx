"use client";
import { useState, useTransition } from "react";
import type { Guest } from "@prisma/client";
import { markSent, deleteGuest, setGuestStatus, regenerateLink, updateGuest } from "../../actions";
import { waPhone } from "@/lib/format";

const STATUS: Record<string, [string, string]> = {
  yes: ["✅ Vai", "bg-emerald-50 text-emerald-700"],
  no: ["❌ Não vai", "bg-red-50 text-red-600"],
  pending: ["⏳ Sem resposta", "bg-zinc-100 text-zinc-600"],
};

export default function GuestRow({
  partyId,
  guest,
  link,
  message,
}: {
  partyId: string;
  guest: Guest;
  link: string;
  message: string;
}) {
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, start] = useTransition();

  const phone = waPhone(guest.phone);
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const [label, cls] = STATUS[guest.status] ?? STATUS.pending;

  const send = () => {
    window.open(waUrl, "_blank");
    start(() => markSent(partyId, guest.id));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    start(() => markSent(partyId, guest.id));
  };

  if (editing)
    return (
      <li className="card p-3">
        <form
          action={async (f) => {
            await updateGuest(partyId, guest.id, f);
            setEditing(false);
          }}
          className="flex flex-wrap gap-2"
        >
          <input name="name" defaultValue={guest.name} className="input flex-1" required />
          <input name="phone" defaultValue={guest.phone ?? ""} className="input flex-1" placeholder="WhatsApp" />
          <button className="btn-primary">Salvar</button>
          <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancelar</button>
        </form>
      </li>
    );

  return (
    <li className="card grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-3 p-3 sm:flex sm:gap-3">
      <div className="min-w-0 sm:flex-1">
        <p className="font-semibold">
          {guest.name}
          {guest.status === "yes" && guest.companions > 0 && (
            <span className="text-sm font-normal text-zinc-500"> +{guest.companions} acompanhante(s)</span>
          )}
        </p>
        <p className="text-xs text-zinc-500">
          {guest.phone || "sem telefone"}
          {guest.sentAt && " · 📤 enviado"}
          {guest.openedAt && " · 👀 abriu"}
          {guest.selfRegistered && " · 🔗 confirmou pelo link da festa"}
        </p>
        {guest.note && <p className="mt-1 text-sm italic text-zinc-600">“{guest.note}”</p>}
      </div>
      <span className={`self-start whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold sm:self-auto ${cls}`}>{label}</span>
      {phone ? (
        <button onClick={send} className="btn-wa px-4 py-2 text-sm">
          {guest.sentAt ? "Reenviar" : "Enviar convite"}
        </button>
      ) : (
        <button onClick={copy} className="btn-ghost px-4 py-2 text-sm">
          {copied ? "Copiado! ✔" : "Copiar convite"}
        </button>
      )}
      <div className="relative justify-self-end">
        <button onClick={() => setMenu(!menu)} className="rounded-full px-3 py-1 text-xl text-zinc-500 hover:bg-zinc-100" aria-label="Mais opções">⋯</button>
        {menu && (
          <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-zinc-100 bg-white p-1 text-sm shadow-lg" onMouseLeave={() => setMenu(false)}>
            {[
              ["Copiar mensagem", copy],
              ["Copiar só o link", () => navigator.clipboard.writeText(link)],
              ["Abrir convite", () => window.open(link + "?preview=1", "_blank")],
              ["Editar", () => setEditing(true)],
              ["Marcar: vai", () => start(() => setGuestStatus(partyId, guest.id, "yes"))],
              ["Marcar: não vai", () => start(() => setGuestStatus(partyId, guest.id, "no"))],
              ["Marcar: sem resposta", () => start(() => setGuestStatus(partyId, guest.id, "pending"))],
              ["Gerar link novo", () => confirm("O link antigo vai parar de funcionar. Continuar?") && start(() => regenerateLink(partyId, guest.id))],
            ].map(([l, fn]) => (
              <button key={l as string} onClick={() => { setMenu(false); (fn as () => void)(); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-50">
                {l as string}
              </button>
            ))}
            <button
              onClick={() => confirm(`Remover ${guest.name}?`) && start(() => deleteGuest(partyId, guest.id))}
              className="block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
            >
              Remover
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
