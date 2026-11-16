"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { track } from "@/lib/track";

export async function rsvp(token: string, form: FormData) {
  const guest = await db.guest.findUnique({ where: { token }, include: { party: true } });
  if (!guest || !guest.party.active) throw new Error("Convite inválido");
  const status = form.get("status") === "yes" ? "yes" : "no";
  const companions = Math.max(0, Math.min(20, parseInt(String(form.get("companions") || "0"), 10) || 0));
  const note = String(form.get("note") || "").trim().slice(0, 500) || null;
  await db.guest.update({
    where: { id: guest.id },
    data: { status, companions: status === "yes" ? companions : 0, note, respondedAt: new Date() },
  });
  await track({ path: `/c/${token}`, kind: "rsvp", guestId: guest.id, partyId: guest.partyId });
  revalidatePath(`/c/${token}`);
}

export async function pickGift(token: string, giftId: string) {
  const guest = await db.guest.findUnique({ where: { token } });
  if (!guest) throw new Error("Convite inválido");
  // só reserva se ainda estiver livre
  await db.gift.updateMany({ where: { id: giftId, partyId: guest.partyId, guestId: null, kind: "item" }, data: { guestId: guest.id } });
  revalidatePath(`/c/${token}`);
}

export async function unpickGift(token: string, giftId: string) {
  const guest = await db.guest.findUnique({ where: { token } });
  if (!guest) throw new Error("Convite inválido");
  await db.gift.updateMany({ where: { id: giftId, guestId: guest.id }, data: { guestId: null } });
  revalidatePath(`/c/${token}`);
}
