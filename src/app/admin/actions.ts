"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";

export async function toggleParty(id: string) {
  await requireSuperAdmin();
  const p = await db.party.findUnique({ where: { id } });
  if (p) await db.party.update({ where: { id }, data: { active: !p.active } });
  revalidatePath("/admin");
}

export async function resolveError(id: string) {
  await requireSuperAdmin();
  await db.errorLog.update({ where: { id }, data: { resolved: true } });
  revalidatePath("/admin");
}

export async function resolveAllErrors() {
  await requireSuperAdmin();
  await db.errorLog.updateMany({ where: { resolved: false }, data: { resolved: true } });
  revalidatePath("/admin");
}
