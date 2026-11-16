import { headers } from "next/headers";
import { db } from "./db";

function deviceOf(ua: string) {
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/mobile/i.test(ua)) return "Celular";
  return "Computador";
}

export async function track(data: {
  path: string;
  kind: string;
  userId?: string | null;
  guestId?: string | null;
  partyId?: string | null;
}) {
  try {
    const h = await headers();
    const ua = h.get("user-agent") || "";
    if (/bot|crawler|spider|facebookexternalhit|whatsapp/i.test(ua) && data.kind === "invite") {
      // link preview do WhatsApp não conta como abertura
      return;
    }
    await db.accessLog.create({
      data: {
        ...data,
        userAgent: ua.slice(0, 300),
        device: deviceOf(ua),
        ip: (h.get("x-forwarded-for") || "").split(",")[0].trim() || null,
      },
    });
  } catch (e) {
    console.error("track failed", e);
  }
}

export async function logError(e: unknown, path?: string, source = "server") {
  try {
    const err = e instanceof Error ? e : new Error(String(e));
    await db.errorLog.create({
      data: {
        message: err.message.slice(0, 1000),
        stack: err.stack?.slice(0, 4000),
        path,
        source,
      },
    });
  } catch {
    /* ignore */
  }
}
