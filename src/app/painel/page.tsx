import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate, fmtTime, THEMES } from "@/lib/format";

export default async function Painel() {
  const user = await requireUser();
  const parties = await db.party.findMany({
    where: { ownerId: user.id },
    orderBy: { date: "asc" },
    include: { guests: { select: { status: true, companions: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Minhas festas</h1>
        <Link href="/painel/nova" className="btn-primary whitespace-nowrap">+ Nova festa</Link>
      </div>

      {parties.length === 0 ? (
        <div className="card mt-6 text-center">
          <p className="text-5xl">🎉</p>
          <p className="mt-3 font-semibold">Você ainda não criou nenhuma festa.</p>
          <Link href="/painel/nova" className="btn-primary mt-4">Criar a primeira</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {parties.map((p) => {
            const yes = p.guests.filter((g) => g.status === "yes");
            const people = yes.reduce((s, g) => s + 1 + g.companions, 0);
            return (
              <Link key={p.id} href={`/painel/festa/${p.id}`} className="card flex gap-4 hover:shadow-md">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl text-3xl"
                  style={{ background: p.color + "22" }}
                >
                  {p.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    THEMES[p.theme]?.emoji
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">
                    {p.honoreeName} {p.age ? `· ${p.age} anos` : ""}
                  </p>
                  <p className="text-sm first-letter:uppercase text-zinc-600">{fmtDate(p.date)} às {fmtTime(p.date)}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {p.guests.length} convidados · <b className="text-emerald-600">{people} confirmados</b>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
