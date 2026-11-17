const TZ = "America/Sao_Paulo";

export function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(d);
}

export function fmtTime(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(d);
}

export function fmtDateTime(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
}

/** "2026-12-20T15:00" interpretado como horário de Brasília */
export function parseLocal(value: string) {
  return new Date(`${value}:00-03:00`);
}

/** Date -> "2026-12-20T15:00" em horário de Brasília (para <input type=datetime-local>) */
export function toLocalInput(d: Date) {
  const s = new Date(d.getTime() - 3 * 3600 * 1000).toISOString();
  return s.slice(0, 16);
}

export function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

export function waPhone(phone?: string | null) {
  if (!phone) return "";
  let d = onlyDigits(phone);
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return d;
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0];
}

export const THEMES: Record<string, { label: string; emoji: string; font: string; bg: string }> = {
  infantil: { label: "Infantil", emoji: "🎈", font: "font-fun", bg: "bg-confetti" },
  quinze: { label: "15 anos", emoji: "👑", font: "font-elegant", bg: "bg-sparkle" },
  adulto: { label: "Adulto", emoji: "🥂", font: "font-elegant", bg: "bg-sparkle" },
};

export const DEFAULT_GREETING = "Você está convidado(a) para o aniversário de";

/** Frase do topo do convite; null quando o organizador desativou. */
export function greetingText(party: { greeting: string | null; showGreeting: boolean }) {
  if (!party.showGreeting) return null;
  return party.greeting?.trim() || DEFAULT_GREETING;
}
