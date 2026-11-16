"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { track } from "@/lib/track";

export type AuthState = { error?: string } | undefined;

export async function signup(_: AuthState, form: FormData): Promise<AuthState> {
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  if (!name || !email.includes("@")) return { error: "Preencha nome e e-mail." };
  if (password.length < 6) return { error: "A senha precisa ter pelo menos 6 caracteres." };
  if (await db.user.findUnique({ where: { email } })) return { error: "Já existe uma conta com esse e-mail." };

  const user = await db.user.create({
    data: { name, email, password: await bcrypt.hash(password, 10), lastLogin: new Date() },
  });
  await createSession(user.id);
  await track({ path: "/cadastro", kind: "signup", userId: user.id });
  redirect("/painel");
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) return { error: "E-mail ou senha incorretos." };
  await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  await createSession(user.id);
  await track({ path: "/entrar", kind: "login", userId: user.id });
  redirect("/painel");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
