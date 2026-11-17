/**
 * Temas visuais do convite. Cada tema tem uma paleta padrão e o organizador
 * pode trocar qualquer cor (a personalização fica em Party.palette, como JSON).
 */

export type PaletteField = { key: string; label: string; hint?: string };

export type DesignDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** qual cena SVG desenha o topo do convite (nenhuma = visual clássico) */
  scene?: "forest" | "sea" | "farm";
  /** tom do texto que aparece direto sobre a cor `pageKey` (fundo da página) */
  pageKey?: string;
  /** cor do nome da festa e sombra */
  titleShadowKey?: string;
  /** se definido, o nome usa esta cor com contorno claro (para céus claros) */
  titleColorKey?: string;
  palette: Record<string, string>;
  fields: PaletteField[];
};

/** Clássico: pageBg só vale se o organizador trocar (senão fica o fundo estampado do tipo de festa). */
export const CLASSICO_PALETTE = {
  pageBg: "#fdf2f8",
  overlay: "#000000",
  titleText: "#ffffff",
};

export const MAR_PALETTE = {
  waterTop: "#8FE9F0",
  waterUpper: "#3BB8DA",
  waterMid: "#1676B0",
  waterDeep: "#0E4C82",
  seabed: "#0B3558",
  rays: "#FFFFFF",
  coral1: "#FFD25E",
  coral2: "#FF6F61",
  coral3: "#B28CFF",
};

export const FAZENDA_PALETTE = {
  skyTop: "#6EC1F2",
  skyMid: "#BDE7FF",
  skyBottom: "#FFF1C2",
  sun: "#FFE066",
  sunGlow: "#FFF3B0",
  cloud: "#FFFFFF",
  hillFar: "#CDEB9F",
  hillMid: "#9BD474",
  furrow: "#86C463",
  field: "#62AC4B",
  barn: "#D6392E",
  barnRoof: "#8E1F17",
  leaves: "#3F8F3A",
  fence: "#A9703A",
  fenceRail: "#C48A4A",
  soil: "#3B2418",
};

export const FLORESTA_PALETTE = {
  skyTop: "#8E7BD6",
  skyMid: "#E9A2C4",
  skyBottom: "#FFCFA8",
  hills: "#C79BD4",
  treesFar: "#A07CC4",
  treesMid: "#6E52A3",
  treesNear: "#43347E",
  ground: "#2B2459",
  glow: "#FFF3B0",
};

export const DESIGNS: Record<string, DesignDef> = {
  padrao: {
    id: "padrao",
    label: "Clássico",
    emoji: "🎈",
    description: "O convite simples, com a cor que você escolher.",
    palette: CLASSICO_PALETTE,
    fields: [
      { key: "pageBg", label: "Fundo da página" },
      { key: "overlay", label: "Película sobre a foto de fundo" },
      { key: "titleText", label: "Nome sobre a foto de fundo" },
    ],
  },
  floresta: {
    id: "floresta",
    label: "Floresta encantada",
    emoji: "🌲",
    description: "Céu de entardecer, florestas em camadas e vaga-lumes.",
    scene: "forest",
    pageKey: "ground",
    titleShadowKey: "treesMid",
    palette: FLORESTA_PALETTE,
    fields: [
      { key: "skyTop", label: "Céu (topo)" },
      { key: "skyMid", label: "Céu (meio)" },
      { key: "skyBottom", label: "Céu (horizonte)" },
      { key: "hills", label: "Colinas ao fundo" },
      { key: "treesFar", label: "Árvores — fundo" },
      { key: "treesMid", label: "Árvores — meio" },
      { key: "treesNear", label: "Árvores — frente" },
      { key: "ground", label: "Chão e fundo da página" },
      { key: "glow", label: "Vaga-lumes" },
    ],
  },
};

DESIGNS.mar = {
  id: "mar",
  label: "Recife de coral",
  emoji: "🐠",
  description: "Mergulho no recife: água, raios de sol, peixes, bolhas e corais.",
  scene: "sea",
  pageKey: "seabed",
  titleShadowKey: "waterMid",
  palette: MAR_PALETTE,
  fields: [
    { key: "waterTop", label: "Água (superfície)" },
    { key: "waterUpper", label: "Água (rasa)" },
    { key: "waterMid", label: "Água (meio)" },
    { key: "waterDeep", label: "Água (funda)" },
    { key: "seabed", label: "Fundo do mar e da página" },
    { key: "rays", label: "Raios de luz, bolhas e peixes" },
    { key: "coral1", label: "Coral 1" },
    { key: "coral2", label: "Coral 2" },
    { key: "coral3", label: "Coral 3" },
  ],
};

DESIGNS.fazenda = {
  id: "fazenda",
  label: "Fazendinha",
  emoji: "🚜",
  description: "Dia de sol na roça: celeiro vermelho, colinas, cerca e nuvens.",
  scene: "farm",
  pageKey: "soil",
  titleColorKey: "barn",
  palette: FAZENDA_PALETTE,
  fields: [
    { key: "skyTop", label: "Céu (topo)" },
    { key: "skyMid", label: "Céu (meio)" },
    { key: "skyBottom", label: "Céu (horizonte)" },
    { key: "sun", label: "Sol" },
    { key: "sunGlow", label: "Brilho e raios do sol" },
    { key: "cloud", label: "Nuvens" },
    { key: "hillFar", label: "Colina ao fundo" },
    { key: "hillMid", label: "Colina do meio" },
    { key: "field", label: "Pasto da frente" },
    { key: "barn", label: "Celeiro e nome" },
    { key: "barnRoof", label: "Telhado do celeiro" },
    { key: "leaves", label: "Árvore" },
    { key: "fence", label: "Cerca (postes)" },
    { key: "soil", label: "Terra e fundo da página" },
  ],
};

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Lê o JSON salvo e devolve a paleta final (padrão do tema + trocas válidas). */
export function resolvePalette(design: string, raw?: string | null): Record<string, string> {
  const def = DESIGNS[design] ?? DESIGNS.padrao;
  const out = { ...def.palette };
  if (!raw) return out;
  try {
    const saved = JSON.parse(raw) as Record<string, unknown>;
    for (const k of Object.keys(out)) {
      const v = saved[k];
      if (typeof v === "string" && HEX.test(v)) out[k] = v;
    }
  } catch {
    /* JSON inválido: usa o padrão */
  }
  return out;
}

/** Pega do formulário (campos p_<chave>) só o que difere do padrão. */
export function paletteFromForm(design: string, form: FormData): string | null {
  const def = DESIGNS[design];
  if (!def || !def.fields.length) return null;
  const changed: Record<string, string> = {};
  for (const f of def.fields) {
    const v = String(form.get(`p_${f.key}`) || "").toLowerCase();
    if (HEX.test(v) && v !== def.palette[f.key].toLowerCase()) changed[f.key] = v;
  }
  return Object.keys(changed).length ? JSON.stringify(changed) : null;
}

/** true se a cor é escura (para escolher texto claro por cima). */
export function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}
