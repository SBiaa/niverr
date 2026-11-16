import Link from "next/link";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { toggleParty, resolveError, resolveAllErrors } from "./actions";

const KIND: Record<string, string> = {
  invite: "👀 Abriu convite",
  rsvp: "✅ Respondeu",
  login: "🔑 Login",
  signup: "🆕 Cadastro",
  page: "📄 Visita",
  party: "🌐 Página da festa",
};

const TABS = [
  ["geral", "📊 Visão geral"],
  ["acessos", "🕒 Acessos"],
  ["erros", "🐞 Erros"],
  ["festas", "🎉 Festas"],
  ["usuarios", "👤 Organizadores"],
] as const;

function dayKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);
}

export default async function Admin({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  await requireSuperAdmin();
  const { aba = "geral" } = await searchParams;
  const since = new Date(Date.now() - 30 * 86400000);
  const last24 = new Date(Date.now() - 86400000);

  const [users, parties, guests, yes, no, opened, sent, errorsOpen, access24, logs30, errors] = await Promise.all([
    db.user.count(),
    db.party.count(),
    db.guest.count(),
    db.guest.count({ where: { status: "yes" } }),
    db.guest.count({ where: { status: "no" } }),
    db.guest.count({ where: { openedAt: { not: null } } }),
    db.guest.count({ where: { sentAt: { not: null } } }),
    db.errorLog.count({ where: { resolved: false } }),
    db.accessLog.count({ where: { createdAt: { gte: last24 } } }),
    db.accessLog.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, kind: true, device: true } }),
    db.errorLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  // série diária (30 dias)
  const days: { key: string; label: string; invite: number; rsvp: number; signup: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({ key: dayKey(d), label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" }), invite: 0, rsvp: 0, signup: 0 });
  }
  const devices: Record<string, number> = {};
  for (const l of logs30) {
    const day = days.find((d) => d.key === dayKey(l.createdAt));
    if (day && (l.kind === "invite" || l.kind === "rsvp" || l.kind === "signup")) day[l.kind]++;
    if (l.device) devices[l.device] = (devices[l.device] || 0) + 1;
  }
  const max = Math.max(1, ...days.map((d) => d.invite + d.rsvp + d.signup));
  const responseRate = guests ? Math.round(((yes + no) / guests) * 100) : 0;
  const openRate = guests ? Math.round((opened / guests) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-zinc-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-fun text-xl font-bold">niverr · admin da plataforma</span>
          <Link href="/painel" className="text-sm text-zinc-300">Meu painel →</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200">
          {TABS.map(([k, l]) => (
            <Link key={k} href={`?aba=${k}`} className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold ${aba === k ? "border-violet-600 text-violet-700" : "border-transparent text-zinc-500"}`}>
              {l}
              {k === "erros" && errorsOpen > 0 && <span className="ml-1 rounded-full bg-red-500 px-1.5 text-xs text-white">{errorsOpen}</span>}
            </Link>
          ))}
        </nav>

        {aba === "geral" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["Organizadores", users],
                ["Festas criadas", parties],
                ["Convidados", guests],
                ["Confirmados (vão)", yes],
                ["Taxa de resposta", `${responseRate}%`],
                ["Convites enviados", sent],
                ["Taxa de abertura", `${openRate}%`],
                ["Acessos 24h", access24],
              ].map(([l, v]) => (
                <div key={l as string} className="card p-4">
                  <p className="text-xs font-semibold uppercase text-zinc-500">{l}</p>
                  <p className="text-2xl font-bold">{v}</p>
                </div>
              ))}
            </div>
            {errorsOpen > 0 && (
              <Link href="?aba=erros" className="block rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                🐞 {errorsOpen} erro(s) não resolvido(s) — ver detalhes
              </Link>
            )}

            <div className="card">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">Atividade nos últimos 30 dias</p>
                <div className="flex gap-3 text-xs">
                  <span><i className="inline-block h-2 w-2 rounded-full bg-sky-500" /> Convites abertos</span>
                  <span><i className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Respostas</span>
                  <span><i className="inline-block h-2 w-2 rounded-full bg-violet-500" /> Cadastros</span>
                </div>
              </div>
              <div className="flex h-48 items-end gap-1">
                {days.map((d) => (
                  <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.label}: ${d.invite} aberturas, ${d.rsvp} respostas, ${d.signup} cadastros`}>
                    <div className="bg-violet-500" style={{ height: `${(d.signup / max) * 100}%` }} />
                    <div className="bg-emerald-500" style={{ height: `${(d.rsvp / max) * 100}%` }} />
                    <div className="rounded-t bg-sky-500" style={{ height: `${(d.invite / max) * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-xs text-zinc-400">
                <span>{days[0].label}</span>
                <span>{days[days.length - 1].label}</span>
              </div>
            </div>

            <div className="card">
              <p className="mb-3 font-bold">Dispositivos (30 dias)</p>
              {Object.entries(devices).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
                const total = Object.values(devices).reduce((s, n) => s + n, 0);
                return (
                  <div key={k} className="mb-2">
                    <div className="flex justify-between text-sm"><span>{k}</span><span>{v} ({Math.round((v / total) * 100)}%)</span></div>
                    <div className="h-2 rounded bg-zinc-100"><div className="h-2 rounded bg-violet-500" style={{ width: `${(v / total) * 100}%` }} /></div>
                  </div>
                );
              })}
              {Object.keys(devices).length === 0 && <p className="text-sm text-zinc-500">Sem dados ainda.</p>}
            </div>

            <div className="card">
              <p className="mb-2 font-bold">Relatórios (CSV)</p>
              <div className="flex flex-wrap gap-2">
                <a className="btn-ghost text-sm" href="/api/admin/report?type=festas">Festas</a>
                <a className="btn-ghost text-sm" href="/api/admin/report?type=usuarios">Organizadores</a>
                <a className="btn-ghost text-sm" href="/api/admin/report?type=acessos">Acessos (30 dias)</a>
                <a className="btn-ghost text-sm" href="/api/admin/report?type=erros">Erros</a>
              </div>
            </div>
          </div>
        )}

        {aba === "acessos" && <Accesses />}

        {aba === "erros" && (
          <div className="space-y-3">
            {errorsOpen > 0 && (
              <form action={resolveAllErrors} className="flex justify-end">
                <button className="btn-ghost text-sm">Marcar todos como resolvidos</button>
              </form>
            )}
            {errors.length === 0 && <p className="text-zinc-500">Nenhum erro registrado. 🎉</p>}
            {errors.map((e) => (
              <details key={e.id} className={`card p-3 ${e.resolved ? "opacity-50" : ""}`}>
                <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${e.source === "client" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"}`}>
                    {e.source === "client" ? "navegador" : "servidor"}
                  </span>
                  <span className="flex-1 font-mono text-sm">{e.message}</span>
                  <span className="text-xs text-zinc-500">{e.path} · {fmtDateTime(e.createdAt)}</span>
                </summary>
                {e.stack && <pre className="mt-2 max-h-64 overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">{e.stack}</pre>}
                {!e.resolved && (
                  <form action={resolveError.bind(null, e.id)} className="mt-2">
                    <button className="text-sm font-semibold text-emerald-700">✔ Marcar como resolvido</button>
                  </form>
                )}
              </details>
            ))}
          </div>
        )}

        {aba === "festas" && <Parties />}
        {aba === "usuarios" && <Users />}
      </main>
    </div>
  );
}

async function Accesses() {
  const logs = await db.accessLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const guestIds = [...new Set(logs.map((l) => l.guestId).filter(Boolean))] as string[];
  const userIds = [...new Set(logs.map((l) => l.userId).filter(Boolean))] as string[];
  const [gs, us] = await Promise.all([
    db.guest.findMany({ where: { id: { in: guestIds } }, select: { id: true, name: true, party: { select: { honoreeName: true } } } }),
    db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } }),
  ]);
  const gm = new Map(gs.map((g) => [g.id, g]));
  const um = new Map(us.map((u) => [u.id, u]));
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr><th className="p-3">Quando</th><th className="p-3">Evento</th><th className="p-3">Quem</th><th className="p-3">Dispositivo</th><th className="p-3">IP</th></tr>
        </thead>
        <tbody>
          {logs.map((l) => {
            const g = l.guestId ? gm.get(l.guestId) : null;
            const u = l.userId ? um.get(l.userId) : null;
            return (
              <tr key={l.id} className="border-t border-zinc-100">
                <td className="whitespace-nowrap p-3">{fmtDateTime(l.createdAt)}</td>
                <td className="p-3">{KIND[l.kind] ?? l.kind}</td>
                <td className="p-3">
                  {g ? <>{g.name} <span className="text-zinc-500">(festa de {g.party.honoreeName})</span></> : u ? <>{u.name} <span className="text-zinc-500">{u.email}</span></> : l.path}
                </td>
                <td className="p-3">{l.device}</td>
                <td className="p-3 font-mono text-xs text-zinc-500">{l.ip}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {logs.length === 0 && <p className="p-4 text-zinc-500">Nenhum acesso ainda.</p>}
    </div>
  );
}

async function Parties() {
  const parties = await db.party.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { owner: { select: { name: true, email: true } }, guests: { select: { status: true, openedAt: true } } },
  });
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr><th className="p-3">Festa</th><th className="p-3">Organizador</th><th className="p-3">Data</th><th className="p-3">Convidados</th><th className="p-3">Abriram</th><th className="p-3">Vão</th><th className="p-3">Status</th></tr>
        </thead>
        <tbody>
          {parties.map((p) => (
            <tr key={p.id} className="border-t border-zinc-100">
              <td className="p-3 font-semibold">{p.honoreeName} {p.age ? `(${p.age})` : ""}</td>
              <td className="p-3">{p.owner.name}<br /><span className="text-xs text-zinc-500">{p.owner.email}</span></td>
              <td className="whitespace-nowrap p-3">{fmtDateTime(p.date)}</td>
              <td className="p-3">{p.guests.length}</td>
              <td className="p-3">{p.guests.filter((g) => g.openedAt).length}</td>
              <td className="p-3">{p.guests.filter((g) => g.status === "yes").length}</td>
              <td className="p-3">
                <form action={toggleParty.bind(null, p.id)}>
                  <button className={`rounded-full px-3 py-1 text-xs font-semibold ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-200 text-zinc-600"}`}>
                    {p.active ? "Ativa · desativar" : "Desativada · ativar"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function Users() {
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { _count: { select: { parties: true } } } });
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Festas</th><th className="p-3">Cadastro</th><th className="p-3">Último login</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-zinc-100">
              <td className="p-3 font-semibold">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u._count.parties}</td>
              <td className="whitespace-nowrap p-3">{fmtDateTime(u.createdAt)}</td>
              <td className="whitespace-nowrap p-3">{u.lastLogin ? fmtDateTime(u.lastLogin) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
