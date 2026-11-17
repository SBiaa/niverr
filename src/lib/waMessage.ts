import { fmtDate, fmtTime, firstName } from "@/lib/format";

export type WaKind = "guest" | "public";

const COMMON_VARS: [string, string][] = [
  ["{aniversariante}", "nome do aniversariante"],
  ["{idade}", "idade (ex: 7 anos)"],
  ["{data}", "data da festa"],
  ["{hora}", "horário"],
  ["{local}", "nome do local"],
  ["{link}", "link do convite"],
];

export const WA_KINDS: Record<WaKind, { title: string; vars: [string, string][]; defaultTemplate: string; sample: string }> = {
  guest: {
    title: "✏️ Editar texto da mensagem do WhatsApp (convite de cada convidado)",
    vars: [["{nome}", "primeiro nome do convidado"], ...COMMON_VARS],
    defaultTemplate:
      "Olá, {nome}! 🎉\n\n" +
      "Você está convidado(a) para o aniversário de {idade} de {aniversariante}!\n" +
      "📅 {data} às {hora}\n" +
      "📍 {local}\n\n" +
      "Confirme sua presença pelo link:\n{link}",
    sample: "Maria Silva",
  },
  public: {
    title: "✏️ Editar texto da mensagem do link geral",
    vars: COMMON_VARS,
    defaultTemplate:
      "🎉 Você está convidado(a) para o aniversário de {aniversariante}!\n" +
      "Veja os detalhes e confirme sua presença:\n{link}",
    sample: "",
  },
};

type P = { honoreeName: string; age: number | null; date: Date; venueName: string };

export function buildWaMessage(party: P, kind: WaKind, guestName: string, link: string, saved?: string | null) {
  const tpl = saved?.trim() ? saved : WA_KINDS[kind].defaultTemplate;
  const honoree = party.honoreeName.trim();
  const vars: Record<string, string> = {
    nome: firstName(guestName || ""),
    aniversariante: honoree ? `*${honoree}*` : "",
    idade: party.age ? `${party.age} anos` : "",
    data: fmtDate(party.date),
    hora: fmtTime(party.date),
    local: party.venueName,
    link,
  };
  // idade/aniversariante vazios somem junto com o "de" que vem antes
  let out = tpl.replace(/(\s+de)?(\s*)\{(idade|aniversariante)\}/g, (_m, de, sp, k) => (vars[k] ? `${de ?? ""}${sp}${vars[k]}` : ""));
  out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  out = out.replace(/[ \t]+([!.,\n])/g, "$1").replace(/ {2,}/g, " ");
  // sem {link} no texto: o link vai no final, senão a pessoa não consegue confirmar
  if (!tpl.includes("{link}")) out = `${out.trimEnd()}\n\n${link}`;
  return out;
}
