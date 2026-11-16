import { customAlphabet } from "nanoid";
import { db } from "./db";

const suffix = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 4);

function base(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30) || "festa"
  );
}

/** Garante que a festa tenha um slug público (ex: "isadora-k3p9"). */
export async function ensureSlug(party: { id: string; slug: string | null; honoreeName: string }) {
  if (party.slug) return party.slug;
  for (let i = 0; i < 5; i++) {
    const slug = `${base(party.honoreeName)}-${suffix()}`;
    try {
      await db.party.update({ where: { id: party.id }, data: { slug } });
      return slug;
    } catch {
      /* colisão: tenta outro */
    }
  }
  throw new Error("Não foi possível gerar o link da festa");
}
