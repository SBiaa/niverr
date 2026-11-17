import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

const STATUS: Record<string, string> = { yes: "Vai", no: "Não vai", pending: "Sem resposta" };

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return new Response("Não autorizado", { status: 401 });
  const party = await db.party.findFirst({
    where: { id, ownerId: user.id },
    include: { guests: { orderBy: { name: "asc" } } },
  });
  if (!party) return new Response("Não encontrado", { status: 404 });

  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [
    ["Nome", "WhatsApp", "Resposta", "Acompanhantes", "Total de pessoas", "Recado"],
    ...party.guests.map((g) => [
      g.name,
      g.phone,
      STATUS[g.status],
      g.companions,
      g.status === "yes" ? 1 + g.companions : 0,
      g.note,
    ]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(esc).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="convidados-${party.honoreeName.replace(/\W+/g, "-") || "festa"}.csv"`,
    },
  });
}
