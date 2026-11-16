"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export type AccountState = { ok?: string; error?: string } | undefined;

export async function updateProfile(_: AccountState, form: FormData): Promise<AccountState> {
  const user = await requireUser();
  const name = String(form.get("name") || "").trim().slice(0, 80);
  const email = String(form.get("email") || "").trim().toLowerCase().slice(0, 120);
  if (name.length < 2) return { error: "Digite seu nome." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "E-mail inválido." };

  if (email !== user.email) {
    const taken = await db.user.findUnique({ where: { email } });
    if (taken) return { error: "Esse e-mail já está em uso por outra conta." };
    const password = String(form.get("currentPassword") || "");
    if (!(await bcrypt.compare(password, user.password)))
      return { error: "Para trocar o e-mail, confirme sua senha atual." };
  }

  await db.user.update({ where: { id: user.id }, data: { name, email } });
  revalidatePath("/painel", "layout");
  return { ok: "Dados salvos!" };
}

export async function updatePassword(_: AccountState, form: FormData): Promise<AccountState> {
  const user = await requireUser();
  const current = String(form.get("current") || "");
  const next = String(form.get("next") || "");
  const confirm = String(form.get("confirm") || "");
  if (!(await bcrypt.compare(current, user.password))) return { error: "Senha atual incorreta." };
  if (next.length < 6) return { error: "A nova senha precisa ter pelo menos 6 caracteres." };
  if (next !== confirm) return { error: "A confirmação não bate com a nova senha." };
  await db.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(next, 10) } });
  return { ok: "Senha alterada!" };
}
