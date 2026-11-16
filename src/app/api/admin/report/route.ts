import { db } from "@/lib/db";
import { getUser, isSuperAdmin } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";

export async function GET(req: Request) {
  const user = await getUser();
  if (!user || !isSuperAdmin(user.email)) return new Response("Não autorizado", { status: 401 });
  const type = new URL(req.url).searchParams.get("type");
  let rows: unknown[][] = [];

  if (type === "festas") {
    const ps = await db.party.findMany({ include: { owner: true, guests: true }, orderBy: { createdAt: "desc" } });
    rows = [["Aniversariante", "Idade", "Tema", "Data", "Organizador", "E-mail", "Convidados", "Enviados", "Abriram", "Vão", "Não vão", "Pessoas", "Ativa", "Criada em"],
      ...ps.map((p) => [p.honoreeName, p.age, p.theme, fmtDateTime(p.date), p.owner.name, p.owner.email, p.guests.length,
        p.guests.filter((g) => g.sentAt).length, p.guests.filter((g) => g.openedAt).length,
        p.guests.filter((g) => g.status === "yes").length, p.guests.filter((g) => g.status === "no").length,
        p.guests.filter((g) => g.status === "yes").reduce((s, g) => s + 1 + g.companions, 0), p.active ? "sim" : "não", fmtDateTime(p.createdAt)])];
  } else if (type === "usuarios") {
    const us = await db.user.findMany({ include: { _count: { select: { parties: true } } }, orderBy: { createdAt: "desc" } });
    rows = [["Nome", "E-mail", "Festas", "Cadastro", "Último login"],
      ...us.map((u) => [u.name, u.email, u._count.parties, fmtDateTime(u.createdAt), u.lastLogin ? fmtDateTime(u.lastLogin) : ""])];
  } else if (type === "acessos") {
    const ls = await db.accessLog.findMany({ where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } }, orderBy: { createdAt: "desc" } });
    rows = [["Quando", "Tipo", "Caminho", "Dispositivo", "IP", "User agent"],
      ...ls.map((l) => [fmtDateTime(l.createdAt), l.kind, l.path, l.device, l.ip, l.userAgent])];
  } else if (type === "erros") {
    const es = await db.errorLog.findMany({ orderBy: { createdAt: "desc" } });
    rows = [["Quando", "Origem", "Página", "Mensagem", "Resolvido"],
      ...es.map((e) => [fmtDateTime(e.createdAt), e.source, e.path, e.message, e.resolved ? "sim" : "não"])];
  } else return new Response("Tipo inválido", { status: 400 });

  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + rows.map((r) => r.map(esc).join(";")).join("\r\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="niverr-${type}.csv"` },
  });
}
