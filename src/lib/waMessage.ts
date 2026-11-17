import { fmtDate, fmtTime, firstName } from "@/lib/format";

export const WA_VARS: [string, string][] = [
  ["{nome}", "primeiro nome do convidado"],
  ["{aniversariante}", "nome do aniversariante"],
  ["{idade}", "idade (ex: 7 anos)"],
  ["{data}", "data da festa"],
  ["{hora}", "horário"],
  ["{local}", "nome do local"],
  ["{link}", "link do convite"],
];

export const DEFAULT_WA_TEMPLATE =
  "Olá, {nome}! 🎉\n\n" +
  "Você está convidado(a) para o aniversário {idade} {aniversariante}!\n" +
  "📅 {data} às {hora}\n" +
  "📍 {local}\n\n" +
  "Confirme sua presença pelo link:\n{link}";

type P = { honoreeName: string; age: number | null; date: Date; venueName: string; waTemplate: string | null };

export function buildWaMessage(party: P, guestName: string, link: string, template?: string | null) {
  const tpl = (template ?? party.waTemplate)?.trim() ? (template ?? party.waTemplate)! : DEFAULT_WA_TEMPLATE;
  const honoree = party.honoreeName.trim();
  const vars: Record<string, string> = {
    nome: firstName(guestName),
    aniversariante: honoree ? `de *${honoree}*` : "",
    idade: party.age ? `de ${party.age} anos` : "",
    data: fmtDate(party.date),
    hora: fmtTime(party.date),
    local: party.venueName,
    link,
  };
  let out = tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  out = out.replace(/[ \t]+([!.,\n])/g, "$1").replace(/ {2,}/g, " ");
  // sem {link} no texto: o link vai no final, senão a pessoa não consegue confirmar
  if (!tpl.includes("{link}")) out = `${out.trimEnd()}\n\n${link}`;
  return out;
}
