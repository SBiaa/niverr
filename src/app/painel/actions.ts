"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { customAlphabet } from "nanoid";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { parseLocal } from "@/lib/format";
import { saveImage, removeImage } from "@/lib/storage";

const makeToken = customAlphabet("abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);

async function ownParty(partyId: string) {
  const user = await requireUser();
  const party = await db.party.findFirst({ where: { id: partyId, ownerId: user.id } });
  if (!party) throw new Error("Festa não encontrada");
  return party;
}

function partyFields(form: FormData) {
  const date = String(form.get("date") || "");
  const age = parseInt(String(form.get("age") || ""), 10);
  return {
    honoreeName: String(form.get("honoreeName") || "").trim(),
    age: Number.isFinite(age) ? age : null,
    theme: String(form.get("theme") || "infantil"),
    color: String(form.get("color") || "#ec4899"),
    date: parseLocal(date),
    endTime: String(form.get("endTime") || "").trim() || null,
    venueName: String(form.get("venueName") || "").trim(),
    address: String(form.get("address") || "").trim(),
    message: String(form.get("message") || "").trim() || null,
  };
}

export async function createParty(form: FormData) {
  const user = await requireUser();
  const data = partyFields(form);
  if (!data.honoreeName || !data.venueName || !data.address || isNaN(data.date.getTime()))
    throw new Error("Preencha os campos obrigatórios");
  const party = await db.party.create({ data: { ...data, ownerId: user.id } });
  redirect(`/painel/festa/${party.id}`);
}

export async function updateParty(partyId: string, form: FormData) {
  await ownParty(partyId);
  await db.party.update({ where: { id: partyId }, data: partyFields(form) });
  revalidatePath(`/painel/festa/${partyId}`);
}

export async function deleteParty(partyId: string) {
  await ownParty(partyId);
  await db.party.delete({ where: { id: partyId } });
  redirect("/painel");
}

/* ---------- convidados ---------- */
export async function addGuests(partyId: string, form: FormData) {
  await ownParty(partyId);
  const single = String(form.get("name") || "").trim();
  const bulk = String(form.get("bulk") || "");
  const rows: { name: string; phone: string | null }[] = [];
  if (single) rows.push({ name: single, phone: String(form.get("phone") || "").trim() || null });
  for (const line of bulk.split(/\r?\n/)) {
    const l = line.trim();
    if (!l) continue;
    const m = l.match(/^(.*?)[\s,;\-–]*(\+?[\d()\s-]{8,})$/);
    if (m && m[1].trim()) rows.push({ name: m[1].trim(), phone: m[2].trim() });
    else rows.push({ name: l, phone: null });
  }
  if (!rows.length) return;
  await db.guest.createMany({ data: rows.map((r) => ({ ...r, partyId, token: makeToken() })) });
  revalidatePath(`/painel/festa/${partyId}`);
}

export async function updateGuest(partyId: string, guestId: string, form: FormData) {
  await ownParty(partyId);
  await db.guest.update({
    where: { id: guestId, partyId },
    data: {
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim() || null,
    },
  });
  revalidatePath(`/painel/festa/${partyId}`);
}

export async function setGuestStatus(partyId: string, guestId: string, status: string) {
  await ownParty(partyId);
  await db.guest.update({
    where: { id: guestId, partyId },
    data: { status, respondedAt: status === "pending" ? null : new Date() },
  });
  revalidatePath(`/painel/festa/${partyId}`);
}

export async function deleteGuest(partyId: string, guestId: string) {
  await ownParty(partyId);
  await db.guest.delete({ where: { id: guestId, partyId } });
  revalidatePath(`/painel/festa/${partyId}`);
}

export async function markSent(partyId: string, guestId: string) {
  await ownParty(partyId);
  await db.guest.update({ where: { id: guestId, partyId }, data: { sentAt: new Date() } });
  revalidatePath(`/painel/festa/${partyId}`);
}

export async function regenerateLink(partyId: string, guestId: string) {
  await ownParty(partyId);
  await db.guest.update({ where: { id: guestId, partyId }, data: { token: makeToken(), sentAt: null } });
  revalidatePath(`/painel/festa/${partyId}`);
}

/* ---------- fotos ---------- */
export async function uploadPhotos(partyId: string, form: FormData) {
  await ownParty(partyId);
  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  for (const f of files.slice(0, 20)) {
    const url = await saveImage(f, `parties/${partyId}`);
    await db.photo.create({ data: { partyId, url } });
  }
  revalidatePath(`/painel/festa/${partyId}`);
}

export async function setCover(partyId: string, url: string | null) {
  await ownParty(partyId);
  await db.party.update({ where: { id: partyId }, data: { coverUrl: url } });
  revalidatePath(`/painel/festa/${partyId}`);
}

export async function deletePhoto(partyId: string, photoId: string) {
  const party = await ownParty(partyId);
  const photo = await db.photo.delete({ where: { id: photoId, partyId } });
  if (party.coverUrl === photo.url) await db.party.update({ where: { id: partyId }, data: { coverUrl: null } });
  await removeImage(photo.url);
  revalidatePath(`/painel/festa/${partyId}`);
}

/* ---------- presentes ---------- */
export async function addGift(partyId: string, form: FormData) {
  await ownParty(partyId);
  const name = String(form.get("name") || "").trim();
  if (!name) return;
  const link = String(form.get("link") || "").trim();
  await db.gift.create({ data: { partyId, name, link: link || null } });
  revalidatePath(`/painel/festa/${partyId}`);
}

export async function deleteGift(partyId: string, giftId: string) {
  await ownParty(partyId);
  await db.gift.delete({ where: { id: giftId, partyId } });
  revalidatePath(`/painel/festa/${partyId}`);
}

export async function releaseGift(partyId: string, giftId: string) {
  await ownParty(partyId);
  await db.gift.update({ where: { id: giftId, partyId }, data: { guestId: null } });
  revalidatePath(`/painel/festa/${partyId}`);
}
