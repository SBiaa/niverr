"use server";
import { redirect } from "next/navigation";
import { customAlphabet } from "nanoid";
import { db } from "@/lib/db";
import { track } from "@/lib/track";
import { onlyDigits } from "@/lib/format";

const makeToken = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 10);

export type OpenRsvpState = { error?: string; name?: string; phone?: string } | undefined;

/**
 * Confirmação pela página pública da festa.
 * Se o telefone já estiver na lista do organizador, atualiza aquele convidado;
 * senão, cria um convidado novo marcado como "se cadastrou pelo link".
 * Depois manda a pessoa pro convite pessoal dela (/c/token).
 */
export async function openRsvp(slug: string, _: OpenRsvpState, form: FormData): Promise<OpenRsvpState> {
  const party = await db.party.findUnique({ where: { slug } });
  if (!party || !party.active) return { error: "Festa não encontrada." };

  const name = String(form.get("name") || "").trim().slice(0, 80);
  const phone = String(form.get("phone") || "").trim().slice(0, 30);
  const status = form.get("status") === "yes" ? "yes" : form.get("status") === "no" ? "no" : null;
  const companions = Math.max(0, Math.min(20, parseInt(String(form.get("companions") || "0"), 10) || 0));
  const note = String(form.get("note") || "").trim().slice(0, 500) || null;

  if (name.length < 2) return { error: "Digite seu nome.", name, phone };
  if (onlyDigits(phone).length < 10) return { error: "Digite seu WhatsApp com DDD.", name, phone };
  if (!status) return { error: "Escolha se você vai ou não.", name, phone };

  const digits = onlyDigits(phone).slice(-11);
  const guests = await db.guest.findMany({ where: { partyId: party.id, phone: { not: null } } });
  const existing = guests.find((g) => onlyDigits(g.phone!).slice(-11) === digits);

  const data = {
    status,
    companions: status === "yes" ? companions : 0,
    note,
    respondedAt: new Date(),
    openedAt: new Date(),
  };

  const guest = existing
    ? await db.guest.update({ where: { id: existing.id }, data })
    : await db.guest.create({
        data: { ...data, partyId: party.id, name, phone, token: makeToken(), selfRegistered: true },
      });

  await track({ path: `/f/${slug}`, kind: "rsvp", guestId: guest.id, partyId: party.id });
  redirect(`/c/${guest.token}?ok=1`);
}
